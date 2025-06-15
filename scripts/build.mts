import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as babel from '@babel/core';
import { minify } from 'terser';
import chalk from 'chalk';
import { buildConfig, paths, isDevelopment } from './build.config.mts';
import { fileURLToPath } from 'url';
import * as typescript from 'typescript';

const __filename = fileURLToPath(import.meta.url);

interface PackageJson {
  version: string;
  scripts?: {
    start?: string;
    dev?: string;
    build?: string;
    [key: string]: string | undefined;
  };
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

type SourceMap = babel.BabelFileResult['map'];

async function ensureDir(dir: string): Promise<void> {
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function writeSourceMap(map: SourceMap, outPath: string): Promise<string> {
  const mapPath = path.join(paths.sourceMaps, path.basename(outPath) + '.map');
  await ensureDir(path.dirname(mapPath));
  await fs.writeFile(mapPath, JSON.stringify(map));
  return `//# sourceMappingURL=${path.relative(path.dirname(outPath), mapPath)}`;
}

async function processTypeScript(filePath: string, outPath: string): Promise<void> {
  const source = await fs.readFile(filePath, 'utf8');
  const relativePath = path.relative(paths.src, filePath);

  // First compile TypeScript to JavaScript
  const tsResult = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.ESNext,
      target: typescript.ScriptTarget.ES2020,
      moduleResolution: typescript.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      sourceMap: true,
      inlineSources: true,
      declaration: true
    },
    fileName: filePath
  });

  let code = tsResult.outputText;
  let sourceMap: SourceMap = tsResult.sourceMapText ? JSON.parse(tsResult.sourceMapText) as SourceMap : undefined;

  // Then process with Babel for any additional transformations
  const babelResult = await babel.transformAsync(code, {
    filename: filePath,
    sourceMaps: buildConfig.babel.sourceMaps,
    configFile: path.join(path.dirname(__filename), '..', 'babel.config.mjs'),
    comments: buildConfig.babel.comments,
    compact: buildConfig.babel.compact
  });

  if (!babelResult || !babelResult.code) {
    throw new Error(`Failed to transform ${filePath}`);
  }

  code = babelResult.code;
  sourceMap = babelResult.map;

  if (buildConfig.minify) {
    const minified = await minify(code, {
      ...buildConfig.terser,
      sourceMap: buildConfig.sourceMaps && sourceMap ? {
        content: JSON.stringify(sourceMap),
        url: path.basename(outPath) + '.map'
      } : false
    });

    if (!minified.code) {
      throw new Error(`Minification failed for ${filePath}`);
    }

    code = minified.code;
    sourceMap = minified.map ? (typeof minified.map === 'string' ? JSON.parse(minified.map) as SourceMap : minified.map as SourceMap) : undefined;
  }

  if (buildConfig.sourceMaps && sourceMap) {
    const sourceMapComment = await writeSourceMap(sourceMap, outPath);
    code = code + '\n' + sourceMapComment;
  }

  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, code);

  // Write declaration file if it exists
  const dtsPath = outPath.replace(/\.m?js$/, '.d.ts');
  await fs.writeFile(dtsPath, tsResult.outputText);

  const fileSize = Buffer.from(code).length;
  console.log(
    chalk.green('✓'),
    chalk.dim(relativePath),
    chalk.dim(`${(fileSize / 1024).toFixed(2)} KB`),
    buildConfig.minify ? chalk.yellow('minified') : ''
  );
}

async function copyTemplates(): Promise<void> {
  if (!fsSync.existsSync(paths.templates)) return;
  
  const templates = await fs.readdir(paths.templates);
  const targetDir = path.join(paths.dist, 'templates');
  
  for (const template of templates) {
    const src = path.join(paths.templates, template);
    const dest = path.join(targetDir, template);
    await copyFile(src, dest);
  }
}

async function build(): Promise<void> {
  try {
    console.log(chalk.blue(`Starting ${isDevelopment ? 'development' : 'production'} build...`));

    if (fsSync.existsSync(paths.dist)) {
      await fs.rm(paths.dist, { recursive: true });
    }
    await ensureDir(paths.dist);

    if (buildConfig.sourceMaps) {
      await ensureDir(paths.sourceMaps);
    }

    console.log(chalk.yellow('Processing source files...'));
    const files = await fs.readdir(paths.src, { recursive: true, withFileTypes: true });
    
    for (const file of files) {
      if (!file.isFile()) continue;
      
      const filePath = path.join(file.path, file.name);
      const relativePath = path.relative(paths.src, filePath);
      const outPath = path.join(paths.dist, relativePath)
        .replace(/\.tsx?$/, '.js')
        .replace(/\.jsx$/, '.js')
        .replace(/\.mts$/, '.mjs');

      if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.mts')) {
        await processTypeScript(filePath, outPath);
      }
    }

    console.log(chalk.yellow('Copying templates...'));
    await copyTemplates();

    console.log(chalk.yellow('Copying package files...'));
    const pkgJson = JSON.parse(
      await fs.readFile(path.join(path.dirname(__filename), '..', 'package.json'), 'utf-8')
    ) as PackageJson;
    
    const distPkg: PackageJson = {
      ...pkgJson,
      main: 'index.mjs',
      types: 'index.d.ts',
      type: 'module',
      scripts: pkgJson.scripts ? {
        start: pkgJson.scripts.start
      } : undefined
    };
    
    if (!isDevelopment) {
      delete distPkg.devDependencies;
      if (distPkg.scripts) {
        delete distPkg.scripts.dev;
        delete distPkg.scripts.build;
      }
    }
    
    await fs.writeFile(
      path.join(paths.dist, 'package.json'),
      JSON.stringify(distPkg, null, 2)
    );
    
    await copyFile(
      path.join(path.dirname(__filename), '..', 'README.md'),
      path.join(paths.dist, 'README.md')
    );

    console.log(chalk.green('Build completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Build failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  void build();
}

export default build;