#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const build = require('../scripts/build');

const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .description('PaulJS CLI - Development and build tools');

program
  .command('serve')
  .description('Start the development server')
  .option('--watch', 'Watch for file changes')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(async (options) => {
    try {
      const pagesDir = path.join(process.cwd(), 'pages');
      const indexPath = path.join(pagesDir, 'index.js');

      if (!fs.existsSync(indexPath)) {
        console.error(chalk.red('Error: Could not find pages/index.js'));
        console.log(chalk.yellow('Make sure you are in a PaulJS project directory'));
        process.exit(1);
      }

      const app = require(indexPath);
      
      if (options.watch) {
        const chokidar = require('chokidar');
        const watcher = chokidar.watch(['pages/**/*.js', 'public/**/*'], {
          ignored: /(^|[\/\\])\../,
          persistent: true
        });

        watcher.on('change', (path) => {
          console.log(chalk.yellow(`File ${path} changed, reloading...`));
          delete require.cache[require.resolve(indexPath)];
          try {
            const newApp = require(indexPath);
            if (app.stop) app.stop();
            newApp.start(parseInt(options.port));
          } catch (error) {
            console.error(chalk.red('Error reloading application:', error.message));
          }
        });
      }

      await app.start(parseInt(options.port));
      console.log(chalk.green(`Server running at http://localhost:${options.port}`));
      
      if (options.watch) {
        console.log(chalk.blue('Watching for file changes...'));
      }
    } catch (error) {
      console.error(chalk.red('Error starting server:', error.message));
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
      console.error(chalk.red('Error building project:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv); 