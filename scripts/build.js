const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const babel = require('@babel/core');
const { minify } = require('terser');
const chalk = require('chalk');
const { buildConfig, paths, isDevelopment } = require('./build.config');

async function ensureDir(dir) {
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function writeSourceMap(map, outPath) {
  const mapPath = path.join(paths.sourceMaps, path.basename(outPath) + '.map');
  await ensureDir(path.dirname(mapPath));
  await fs.writeFile(mapPath, JSON.stringify(map));
  return `//# sourceMappingURL=${path.relative(path.dirname(outPath), mapPath)}`;
}

async function processJavaScript(filePath, outPath) {
  const source = await fs.readFile(filePath, 'utf8');
  const relativePath = path.relative(paths.src, filePath);
  
  const babelResult = await babel.transformAsync(source, {
    filename: filePath,
    sourceMaps: buildConfig.babel.sourceMaps,
    configFile: path.join(__dirname, '..', 'babel.config.js'),
    comments: buildConfig.babel.comments,
    compact: buildConfig.babel.compact
  });

  if (!babelResult || !babelResult.code) {
    throw new Error(`Failed to transform ${filePath}`);
  }

  let code = babelResult.code;
  let sourceMap = babelResult.map;

  if (buildConfig.minify) {
    const minified = await minify(code, {
      ...buildConfig.terser,
      sourceMap: buildConfig.sourceMaps ? {
        content: sourceMap,
        url: path.basename(outPath) + '.map'
      } : false
    });

    if (minified.error) {
      throw new Error(`Minification failed for ${filePath}: ${minified.error}`);
    }

    code = minified.code;
    sourceMap = minified.map;
  }

  if (buildConfig.sourceMaps && sourceMap) {
    const sourceMapComment = await writeSourceMap(sourceMap, outPath);
    code = code + '\n' + sourceMapComment;
  }

  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, code);

  const fileSize = Buffer.from(code).length;
  console.log(
    chalk.green('✓'),
    chalk.dim(relativePath),
    chalk.dim(`${(fileSize / 1024).toFixed(2)} KB`),
    buildConfig.minify ? chalk.yellow('minified') : ''
  );
}

async function copyTemplates() {
  if (!fsSync.existsSync(paths.templates)) return;
  
  const templates = await fs.readdir(paths.templates);
  const targetDir = path.join(paths.dist, 'templates');
  
  for (const template of templates) {
    const src = path.join(paths.templates, template);
    const dest = path.join(targetDir, template);
    await copyFile(src, dest);
  }
}

async function build() {
  try {
    console.log(chalk.blue(`Starting ${isDevelopment ? 'development' : 'production'} build...`));

    if (fsSync.existsSync(paths.dist)) {
      await fs.rm(paths.dist, { recursive: true });
    }
    await ensureDir(paths.dist);

    if (buildConfig.sourceMaps) {
      await ensureDir(paths.sourceMaps);
    }

    const { createApp } = require('../src/index');
    const app = createApp();
    app.clearComponentCache();

    console.log(chalk.yellow('Processing JavaScript files...'));
    const files = await fs.readdir(paths.src, { recursive: true, withFileTypes: true });
    
    for (const file of files) {
      if (!file.isFile()) continue;
      
      const filePath = path.join(file.path, file.name);
      const relativePath = path.relative(paths.src, filePath);
      
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
        const outPath = path.join(paths.dist, relativePath).replace(/\.jsx$/, '.js');
        await processJavaScript(filePath, outPath);
      }
    }

    console.log(chalk.yellow('Copying templates and processing components...'));
    await copyTemplates();

    const customComponentsDir = path.join(process.cwd(), 'components');
    if (fsSync.existsSync(customComponentsDir)) {
      const customComponents = await fs.readdir(customComponentsDir);
      for (const component of customComponents) {
        if (component.endsWith('.js')) {
          const componentPath = path.join(customComponentsDir, component);
          const componentName = path.basename(component, '.js');
          console.log(chalk.green(`Registering custom component: ${componentName}`));
          
          const destPath = path.join(paths.dist, 'components', component);
          await ensureDir(path.dirname(destPath));
          await copyFile(componentPath, destPath);
        }
      }
    }

    console.log(chalk.yellow('Copying package files...'));
    const pkgJson = require('../package.json');
    
    const distPkg = {
      ...pkgJson,
      main: 'index.js',
      types: 'index.d.ts',
      scripts: {
        start: pkgJson.scripts.start
      }
    };
    
    if (!isDevelopment) {
      delete distPkg.devDependencies;
      delete distPkg.scripts.dev;
      delete distPkg.scripts.build;
    }
    
    await fs.writeFile(
      path.join(paths.dist, 'package.json'),
      JSON.stringify(distPkg, null, 2)
    );
    
    await copyFile(
      path.join(__dirname, '..', 'README.md'),
      path.join(paths.dist, 'README.md')
    );

    console.log(chalk.green('Build completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  build();
}

module.exports = build;