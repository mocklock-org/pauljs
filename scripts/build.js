const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const babel = require('@babel/core');
const { minify } = require('terser');
const chalk = require('chalk');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_DIR = path.join(__dirname, '..', 'src');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');

async function ensureDir(dir) {
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function processJavaScript(filePath, outPath) {
  const source = await fs.readFile(filePath, 'utf8');
  
  const result = await babel.transformAsync(source, {
    presets: ['@babel/preset-react'],
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['@babel/plugin-transform-modules-commonjs', { strict: true }]
    ],
    filename: filePath,
  });

  const minified = await minify(result.code, {
    compress: {
      dead_code: true,
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true
    },
    mangle: true,
    output: {
      comments: false
    }
  });

  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, minified.code);
}

async function copyTemplates() {
  if (!fsSync.existsSync(TEMPLATES_DIR)) return;
  
  const templates = await fs.readdir(TEMPLATES_DIR);
  const targetDir = path.join(DIST_DIR, 'templates');
  
  for (const template of templates) {
    const src = path.join(TEMPLATES_DIR, template);
    const dest = path.join(targetDir, template);
    await copyFile(src, dest);
  }
}

async function build() {
  try {
    console.log(chalk.blue('Starting build process...'));

    // Clean dist directory
    if (fsSync.existsSync(DIST_DIR)) {
      await fs.rm(DIST_DIR, { recursive: true });
    }
    await ensureDir(DIST_DIR);

    // Process JavaScript files
    console.log(chalk.yellow('Processing JavaScript files...'));
    const files = await fs.readdir(SRC_DIR, { recursive: true, withFileTypes: true });
    
    for (const file of files) {
      if (!file.isFile()) continue;
      
      const filePath = path.join(file.path, file.name);
      const relativePath = path.relative(SRC_DIR, filePath);
      
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
        const outPath = path.join(DIST_DIR, relativePath).replace(/\.jsx$/, '.js');
        await processJavaScript(filePath, outPath);
      }
    }

    // Copy templates
    console.log(chalk.yellow('Copying templates...'));
    await copyTemplates();

    // Copy package files
    console.log(chalk.yellow('Copying package files...'));
    const pkgJson = require('../package.json');
    
    // Clean up package.json for distribution
    delete pkgJson.devDependencies;
    delete pkgJson.scripts.dev;
    
    await fs.writeFile(
      path.join(DIST_DIR, 'package.json'),
      JSON.stringify(pkgJson, null, 2)
    );
    
    await copyFile(
      path.join(__dirname, '..', 'README.md'),
      path.join(DIST_DIR, 'README.md')
    );

    console.log(chalk.green('✨ Build completed successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  }
}

// If running directly, execute build
if (require.main === module) {
  build();
}

module.exports = build; 