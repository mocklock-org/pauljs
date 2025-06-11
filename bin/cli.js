#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;
const pauljs = require('../src/index');

program
  .version('1.0.0')
  .description('PaulJS CLI - Create beautiful landing pages quickly');

program
  .command('create <project-name>')
  .description('Create a new PaulJS project')
  .action(async (projectName) => {
    console.log(chalk.blue(`Creating new PaulJS project: ${projectName}`));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is your site title?',
        default: 'My Landing Page'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter a brief description:',
        default: 'A beautiful landing page built with PaulJS'
      }
    ]);

    try {
      await fs.mkdir(projectName);
      
      const pagesDir = path.join(projectName, 'pages');
      await fs.mkdir(pagesDir);

      const mainPage = `
const pauljs = require('pauljs');
const app = pauljs.createApp();

// Configure your landing page
app.createPage('/', {
  title: '${answers.title}',
  description: '${answers.description}',
  hero: {
    title: '${answers.title}',
    subtitle: '${answers.description}',
    ctaText: 'Get Started',
    ctaUrl: '#signup'
  },
  cta: {
    title: 'Ready to Start?',
    description: 'Join us today and experience the difference',
    primaryButtonText: 'Sign Up Now',
    primaryButtonUrl: '#signup'
  }
});

module.exports = app;
`;

      await fs.writeFile(path.join(pagesDir, 'index.js'), mainPage);

      const pkg = {
        name: projectName,
        version: '1.0.0',
        scripts: {
          start: 'pauljs serve',
          build: 'pauljs build',
          dev: 'pauljs serve --watch'
        },
        dependencies: {
          pauljs: '^1.0.0'
        }
      };

      await fs.writeFile(
        path.join(projectName, 'package.json'),
        JSON.stringify(pkg, null, 2)
      );

      console.log(chalk.green('\n✨ Project created successfully!'));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white('  npm install'));
      console.log(chalk.white('  npm run dev'));
    } catch (error) {
      console.error(chalk.red('Error creating project:', error.message));
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Start the development server')
  .option('-p, --port <port>', 'port to run on', '3000')
  .option('-w, --watch', 'watch for changes', false)
  .action(async (options) => {
    try {
      const app = require(path.join(process.cwd(), 'pages/index.js'));
      await app.start(parseInt(options.port));

      if (options.watch) {
        console.log(chalk.yellow('Watch mode enabled'));
      }
    } catch (error) {
      console.error(chalk.red('Error starting server:', error.message));
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build static site')
  .option('-o, --output <dir>', 'output directory', 'dist')
  .action(async (options) => {
    try {
      const app = require(path.join(process.cwd(), 'pages/index.js'));
      const outputDir = await app.exportStaticSite(options.output);
      console.log(chalk.green(`\n✨ Static site built successfully in ${outputDir}!`));
    } catch (error) {
      console.error(chalk.red('Error building site:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv); 