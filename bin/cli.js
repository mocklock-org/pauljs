#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;
const build = require('../scripts/build');

const packageJson = require('../package.json');

program
  .version(packageJson.version)
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
          pauljs: `^${packageJson.version}`
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
  .command('build')
  .description('Build the PaulJS package')
  .action(async () => {
    try {
      await build();
      console.log(chalk.green('✨ Package built successfully!'));
    } catch (error) {
      console.error(chalk.red('Error building package:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv); 