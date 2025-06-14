const path = require('path');
const fs = require('fs').promises;
const { createHash } = require('crypto');
const sharp = require('sharp');
const csso = require('csso');
const { minify } = require('terser');

function generateHash(content) {
  return createHash('md5').update(content).digest('hex').slice(0, 8);
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const {
    quality = 80,
    width = null,
    height = null,
    format = 'webp'
  } = options;

  const image = sharp(inputPath);
  
  if (width || height) {
    image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  await image.toFormat(format, { quality })[format]({
    quality,
    lossless: false,
    effort: 6
  }).toFile(outputPath);

  const sizes = [320, 640, 1024, 1920];
  const responsiveImages = await Promise.all(
    sizes.map(async size => {
      const resizedPath = outputPath.replace(/\.[^.]+$/, `-${size}.${format}`);
      await image
        .resize(size, null, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format, { quality })
        .toFile(resizedPath);
      return { size, path: resizedPath };
    })
  );

  return {
    originalPath: outputPath,
    responsiveImages
  };
}

function optimizeCSS(css, options = {}) {
  const result = csso.minify(css, {
    sourceMap: options.sourceMap,
    filename: options.filename,
    ...options
  });
  return result.css;
}

async function optimizeJS(js, options = {}) {
  const result = await minify(js, {
    sourceMap: options.sourceMap,
    ...options
  });
  return result.code;
}

async function createManifest(assets, outputPath) {
  const manifest = {
    version: process.env.npm_package_version,
    assets: {}
  };

  for (const [key, content] of Object.entries(assets)) {
    const hash = generateHash(content);
    const ext = path.extname(key);
    const newPath = key.replace(ext, `-${hash}${ext}`);
    manifest.assets[key] = newPath;
  }

  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

function wrapWithLazyLoading(componentCode) {
  return `
    const React = require('react');
    const { lazy, Suspense } = React;

    const LazyComponent = lazy(() => new Promise(resolve => {
      const delay = process.env.NODE_ENV === 'development' ? 1000 : 0;
      setTimeout(() => {
        resolve({
          default: (function() {
            ${componentCode}
          })()
        });
      }, delay);
    }));

    module.exports = function(props) {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };
  `;
}

async function splitComponent(componentPath) {
  const content = await fs.readFile(componentPath, 'utf8');
  const chunks = [];
  let currentChunk = '';
  let chunkSize = 0;

  const MAX_CHUNK_SIZE = 50 * 1024;

  for (const line of content.split('\n')) {
    const lineSize = Buffer.from(line).length;
    if (chunkSize + lineSize > MAX_CHUNK_SIZE) {
      chunks.push(currentChunk);
      currentChunk = line;
      chunkSize = lineSize;
    } else {
      currentChunk += line + '\n';
      chunkSize += lineSize;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return {
    chunks,
    entryPoint: `
      const chunks = [
        ${chunks.map((_, i) => `() => import('./chunk${i}.js')`).join(',\n')}
      ];
      
      module.exports = async function loadComponent() {
        const loadedChunks = await Promise.all(chunks.map(chunk => chunk()));
        return loadedChunks.reduce((merged, chunk) => ({
          ...merged,
          ...chunk.default
        }), {});
      };
    `
  };
}

module.exports = {
  optimizeImage,
  optimizeCSS,
  optimizeJS,
  createManifest,
  wrapWithLazyLoading,
  splitComponent,
  generateHash
};