#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const build = require('../scripts/build');

const packageJson = require('../package.json');

async function createProjectStructure(projectName, answers) {
  await fsPromises.mkdir(projectName);
  await fsPromises.mkdir(path.join(projectName, 'pages'));
  await fsPromises.mkdir(path.join(projectName, 'components'));
  await fsPromises.mkdir(path.join(projectName, 'styles'));
  await fsPromises.mkdir(path.join(projectName, 'public'));

  const mainPage = `
const pauljs = require('pauljs');
const { components } = pauljs;

// Import custom components
const CustomHero = require('../components/CustomHero');
const CustomCTA = require('../components/CustomCTA');
const CustomFooter = require('../components/CustomFooter');

// Import custom styles
require('../styles/main.css');

const app = pauljs.createApp();

app.createPage('/', {
  title: '${answers.title}',
  description: '${answers.description}',
  
  // Use custom components
  hero: CustomHero({
    title: '${answers.title}',
    subtitle: '${answers.description}',
    ctaText: 'Get Started',
    ctaUrl: '#signup'
  }),
  
  cta: CustomCTA({
    title: 'Ready to Start?',
    description: 'Join us today!',
    primaryButtonText: 'Sign Up',
    primaryButtonUrl: '#signup',
    secondaryButtonText: 'Learn More',
    secondaryButtonUrl: '#learn-more'
  }),
  
  footer: CustomFooter({
    companyName: '${answers.title}',
    links: [
      { text: 'About', url: '/about' },
      { text: 'Features', url: '#features' },
      { text: 'Contact', url: '#contact' }
    ]
  })
});

module.exports = app;
`;

  const customHeroComponent = `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomHero(props) {
  return components.hero({
    ...props,
    backgroundColor: '#f7fafc',
    textColor: '#2d3748',
    // Add any custom styling or behavior
  });
}

module.exports = CustomHero;
`;

  const customCTAComponent = `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomCTA(props) {
  return components.cta({
    ...props,
    backgroundColor: '#edf2f7',
    textColor: '#2d3748',
    // Add any custom styling or behavior
  });
}

module.exports = CustomCTA;
`;

  const customFooterComponent = `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomFooter(props) {
  return components.footer({
    ...props,
    backgroundColor: '#2d3748',
    textColor: '#f7fafc',
    // Add any custom styling or behavior
  });
}

module.exports = CustomFooter;
`;

  const mainCSS = `
/* Custom styles for your landing page */
:root {
  --primary-color: #3182ce;
  --secondary-color: #2d3748;
  --background-color: #ffffff;
  --text-color: #2d3748;
}

/* Override PaulJS component styles */
.pauljs-hero {
  /* Your custom hero styles */
}

.pauljs-cta {
  /* Your custom CTA styles */
}

.pauljs-footer {
  /* Your custom footer styles */
}
`;

  await fsPromises.writeFile(path.join(projectName, 'pages', 'index.js'), mainPage);
  await fsPromises.writeFile(path.join(projectName, 'components', 'CustomHero.js'), customHeroComponent);
  await fsPromises.writeFile(path.join(projectName, 'components', 'CustomCTA.js'), customCTAComponent);
  await fsPromises.writeFile(path.join(projectName, 'components', 'CustomFooter.js'), customFooterComponent);
  await fsPromises.writeFile(path.join(projectName, 'styles', 'main.css'), mainCSS);

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

  await fsPromises.writeFile(
    path.join(projectName, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  const readme = `
# ${answers.title}

${answers.description}

## Project Structure
\`\`\`
${projectName}/
  ├── pages/          # Page configurations
  │   └── index.js    # Main page
  ├── components/     # Custom components
  │   ├── CustomHero.js
  │   ├── CustomCTA.js
  │   └── CustomFooter.js
  ├── styles/        # Custom styles
  │   └── main.css
  └── public/        # Static assets
\`\`\`

## Development

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`
`;

  await fsPromises.writeFile(path.join(projectName, 'README.md'), readme);
}

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
      await createProjectStructure(projectName, answers);

      console.log(chalk.green('\n✨ Project created successfully!'));
      console.log(chalk.yellow('\nProject structure:'));
      console.log(chalk.white(`  ${projectName}/`));
      console.log(chalk.white('    ├── pages/'));
      console.log(chalk.white('    ├── components/'));
      console.log(chalk.white('    ├── styles/'));
      console.log(chalk.white('    └── public/'));
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