const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');
const { minify } = require('terser');

const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function build() {
  try {
    const srcDir = path.join(__dirname, '..', 'src');
    const files = fs.readdirSync(srcDir, { recursive: true });

    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.jsx')) continue;
      
      const srcPath = path.join(srcDir, file);
      const relativePath = path.relative(srcDir, srcPath);
      const distPath = path.join(distDir, relativePath).replace(/\.jsx$/, '.js');

      const outputDir = path.dirname(distPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const source = fs.readFileSync(srcPath, 'utf8');
      const result = await babel.transformAsync(source, {
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-syntax-jsx'],
        filename: srcPath,
      });

      const minified = await minify(result.code, {
        compress: true,
        mangle: true
      });

      fs.writeFileSync(distPath, minified.code);
    }

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 