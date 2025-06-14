#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { execSync } = require('child_process');

async function createProjectStructure(projectPath, answers) {
  const projectName = path.basename(projectPath);

  console.log(chalk.blue('\nCreating your PaulJS project...'));
  
  if (!fs.existsSync(projectPath)) {
    await fsPromises.mkdir(projectPath, { recursive: true });
  }

  const versionTag = process.env.npm_config_tag || 'latest';
  console.log(chalk.blue(`Using PaulJS version tag: ${versionTag}`));

  const projectPackage = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'pauljs serve',
      build: 'pauljs build',
      dev: 'pauljs serve --watch'
    },
    dependencies: {
      'pauljs': versionTag === 'latest' ? require('../package.json').version : `pauljs@${versionTag}`
    }
  };

  const directories = [
    'pages',
    'components',
    'styles',
    'public'
  ];

  for (const dir of directories) {
    await fsPromises.mkdir(path.join(projectPath, dir), { recursive: true });
  }

  const templateDir = path.join(__dirname, '..', 'template');
  if (fs.existsSync(templateDir)) {
    await copyTemplateFiles(templateDir, projectPath, answers);
  } else {
    await createDefaultFiles(projectPath, answers);
  }

  await fsPromises.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(projectPackage, null, 2)
  );

  console.log(chalk.blue('\nInstalling dependencies...'));
  try {
    execSync('npm install', { 
      cwd: projectPath, 
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(chalk.red('\nFailed to install dependencies:'), error);
    process.exit(1);
  }
}

async function copyTemplateFiles(templateDir, targetDir, answers) {
  const files = await fsPromises.readdir(templateDir, { withFileTypes: true });

  for (const file of files) {
    const srcPath = path.join(templateDir, file.name);
    const destPath = path.join(targetDir, file.name);

    if (file.isDirectory()) {
      await fsPromises.mkdir(destPath, { recursive: true });
      await copyTemplateFiles(srcPath, destPath, answers);
    } else {
      let content = await fsPromises.readFile(srcPath, 'utf8');
      content = content.replace(/\{\{projectName\}\}/g, answers.title)
                      .replace(/\{\{description\}\}/g, answers.description);
      await fsPromises.writeFile(destPath, content);
    }
  }
}

async function createDefaultFiles(projectPath, answers) {
  const files = {
    'pages/index.js': `
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
`,
    'components/CustomHero.js': `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomHero(props) {
  return components.hero(Object.assign({}, props, {
    backgroundColor: '#f7fafc',
    textColor: '#2d3748',
  }));
}

module.exports = CustomHero;
`,
    'components/CustomCTA.js': `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomCTA(props) {
  return components.cta(Object.assign({}, props, {
    backgroundColor: '#edf2f7',
    textColor: '#2d3748',
  }));
}

module.exports = CustomCTA;
`,
    'components/CustomFooter.js': `
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomFooter(props) {
  return components.footer(Object.assign({}, props, {
    backgroundColor: '#2d3748',
    textColor: '#f7fafc',
  }));
}

module.exports = CustomFooter;
`,
    'styles/main.css': `
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
`,
    'README.md': `
# ${answers.title}

${answers.description}

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your landing page.

## Project Structure

\`\`\`
${path.basename(projectPath)}/
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

## Learn More

To learn more about PaulJS, check out the [PaulJS documentation](https://github.com/mocklock-org/pauljs).
`
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectPath, filePath);
    await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
    await fsPromises.writeFile(fullPath, content);
  }
}

async function init() {
  console.log(chalk.bold('\nWelcome to PaulJS! 🚀'));
  console.log('Let\'s create your new landing page project.\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: 'Where would you like to create your project?',
      default: './my-landing-page'
    },
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

  const projectPath = path.resolve(answers.projectPath);

  try {
    await createProjectStructure(projectPath, answers);

    console.log(chalk.green('\n✨ Project created successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white(`  cd ${path.relative(process.cwd(), projectPath)}`));
    console.log(chalk.white('  npm run dev'));
    
    console.log(chalk.blue('\nHappy coding! 🎉'));
  } catch (error) {
    console.error(chalk.red('Error creating project:', error.message));
    process.exit(1);
  }
}

// Execute when run directly
if (require.main === module) {
  init();
}

module.exports = {
  createProjectStructure
}; 