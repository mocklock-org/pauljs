import * as path from 'path';
import * as fs from 'fs/promises';
import { createHash } from 'crypto';
import sharp, { type FormatEnum } from 'sharp';
import csso from 'csso';
import { minify, type MinifyOptions } from 'terser';

interface ImageOptions {
  quality?: number;
  width?: number | null;
  height?: number | null;
  format?: string;
}

interface ResponsiveImage {
  size: number;
  path: string;
}

interface OptimizedImage {
  originalPath: string;
  responsiveImages: ResponsiveImage[];
}

interface StyleOptions {
  sourceMap?: boolean;
  filename?: string;
  [key: string]: any;
}

function generateHash(content: string): string {
  return createHash('md5').update(content).digest('hex').slice(0, 8);
}

async function optimizeImage(inputPath: string, outputPath: string, options: ImageOptions = {}): Promise<OptimizedImage> {
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

  await image.toFormat(format as keyof FormatEnum, { quality })
    .toFile(outputPath);

  const sizes = [320, 640, 1024, 1920];
  const responsiveImages = await Promise.all(
    sizes.map(async size => {
      const resizedPath = outputPath.replace(/\.[^.]+$/, `-${size}.${format}`);
      await image
        .resize(size, null, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format as keyof FormatEnum, { quality })
        .toFile(resizedPath);
      return { size, path: resizedPath };
    })
  );

  return {
    originalPath: outputPath,
    responsiveImages
  };
}

function optimizeCSS(css: string, options: StyleOptions = {}): string {
  const result = csso.minify(css, {
    sourceMap: options.sourceMap,
    filename: options.filename,
    ...options
  });
  return result.css;
}

async function optimizeJS(js: string, options: Partial<MinifyOptions> = {}): Promise<string> {
  const result = await minify(js, options);
  return result.code || '';
}

interface Asset {
  [key: string]: string;
}

interface Manifest {
  version: string;
  assets: Asset;
}

async function createManifest(assets: Asset, outputPath: string): Promise<Manifest> {
  const manifest: Manifest = {
    version: process.env.npm_package_version || '0.0.0',
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

function wrapWithLazyLoading(componentCode: string): string {
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

interface ComponentChunks {
  chunks: string[];
  entryPoint: string;
}

async function splitComponent(componentPath: string): Promise<ComponentChunks> {
  const content = await fs.readFile(componentPath, 'utf8');
  const chunks: string[] = [];
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
      
      export default async function loadComponent() {
        const loadedChunks = await Promise.all(chunks.map(chunk => chunk()));
        return loadedChunks.reduce((merged, chunk) => ({
          ...merged,
          ...chunk.default
        }), {});
      };
    `
  };
}

export {
  optimizeImage,
  optimizeCSS,
  optimizeJS,
  createManifest,
  wrapWithLazyLoading,
  splitComponent,
  generateHash,
  type ImageOptions,
  type OptimizedImage,
  type StyleOptions,
  type Asset,
  type Manifest,
  type ComponentChunks
}; 