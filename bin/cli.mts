#!/usr/bin/env node

// Load CSS handler first
import '../scripts/css-handler.mjs';

import { program } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import build from '../scripts/build.mts';
import type { PaulJS } from '../src/index.mjs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
) as PackageJson;

program
  .version(packageJson.version)
  .description('PaulJS CLI - Development and build tools');

program
  .command('serve')
  .description('Start the development server')
  .option('--watch', 'Watch for file changes')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(async (options: { watch?: boolean; port: string }) => {
    try {
      const pagesDir = path.join(process.cwd(), 'pages');
      const indexPath = path.join(pagesDir, 'index.mjs');

      if (!fs.existsSync(indexPath)) {
        console.error(chalk.red('Error: Could not find pages/index.mjs'));
        console.log(chalk.yellow('Make sure you are in a PaulJS project directory'));
        process.exit(1);
      }

      const { default: app } = await import(indexPath) as { default: PaulJS };
      
      if (options.watch) {
        const chokidar = await import('chokidar');
        const watcher = chokidar.watch(['pages/**/*.{js,mjs}', 'public/**/*'], {
          ignored: /[/\\]\./,
          persistent: true
        });

        watcher.on('change', (filePath: string) => {
          console.log(chalk.yellow(`File ${filePath} changed, reloading...`));
          void (async () => {
            try {
              const { default: newApp } = await import(indexPath + '?update=' + Date.now()) as { default: PaulJS };
              app.stop();
              await newApp.start(parseInt(options.port));
            } catch (error) {
              console.error(chalk.red('Error reloading application:'), error instanceof Error ? error.message : String(error));
            }
          })();
        });
      }

      await app.start(parseInt(options.port));
      console.log(chalk.green(`Server running at http://localhost:${options.port}`));
      
      if (options.watch) {
        console.log(chalk.blue('Watching for file changes...'));
      }
    } catch (error) {
      console.error(chalk.red('Error starting server:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build the current project for production')
  .action(async () => {
    try {
      await build();
      console.log(chalk.green('✨ Project built successfully!'));
    } catch (error) {
      console.error(chalk.red('Error building project:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(process.argv); 