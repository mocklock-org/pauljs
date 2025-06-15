#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectAnswers {
  projectPath: string;
  title: string;
  description: string;
}

async function createProjectStructure(projectPath: string, answers: ProjectAnswers): Promise<void> {
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
    type: 'module',
    scripts: {
      start: 'pauljs serve',
      build: 'pauljs build',
      dev: 'pauljs serve --watch'
    },
    dependencies: {
      'pauljs': versionTag === 'latest' ? JSON.parse(
        await fsPromises.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8')
      ).version : `pauljs@${versionTag}`
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

async function copyTemplateFiles(templateDir: string, targetDir: string, answers: ProjectAnswers): Promise<void> {
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

async function createDefaultFiles(projectPath: string, answers: ProjectAnswers): Promise<void> {
  const files = {
    'pages/index.mjs': `
import { createApp } from 'pauljs';
import CustomHero from '../components/CustomHero.mjs';
import CustomCTA from '../components/CustomCTA.mjs';
import CustomFooter from '../components/CustomFooter.mjs';

const app = createApp();

await app.createPage('/', {
  title: '${answers.title}',
  description: '${answers.description}',
  sections: [
    {
      component: CustomHero,
      props: {
        title: '${answers.title}',
        subtitle: '${answers.description}',
        ctaText: 'Get Started',
        ctaUrl: '#signup'
      },
      layout: {
        order: 1,
        container: 'container mx-auto px-4'
      }
    },
    {
      component: CustomCTA,
      props: {
        title: 'Ready to Start?',
        description: 'Join us today!',
        primaryButtonText: 'Sign Up',
        primaryButtonUrl: '#signup',
        secondaryButtonText: 'Learn More',
        secondaryButtonUrl: '#learn-more'
      },
      layout: {
        order: 2,
        container: 'container mx-auto px-4 py-12'
      }
    },
    {
      component: CustomFooter,
      props: {
        companyName: '${answers.title}',
        links: [
          { text: 'About', url: '/about' },
          { text: 'Features', url: '#features' },
          { text: 'Contact', url: '#contact' }
        ]
      },
      layout: {
        order: 3,
        container: 'container mx-auto px-4'
      }
    }
  ]
});

export default app;
`,
    'components/CustomHero.mjs': `
export default {
  render: (props) => \`
    <section class="bg-gray-50 py-20">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">\${props.title}</h1>
        <p class="text-xl text-gray-600 mb-8">\${props.subtitle}</p>
        <a href="\${props.ctaUrl}" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          \${props.ctaText}
        </a>
      </div>
    </section>
  \`,
  defaultProps: {
    title: 'Welcome',
    subtitle: 'Get started with PaulJS',
    ctaText: 'Learn More',
    ctaUrl: '#'
  }
}
`,
    'components/CustomCTA.mjs': `
export default {
  render: (props) => \`
    <section class="bg-gray-100 py-16">
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-4">\${props.title}</h2>
        <p class="text-xl text-gray-600 mb-8">\${props.description}</p>
        <div class="space-x-4">
          <a href="\${props.primaryButtonUrl}" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            \${props.primaryButtonText}
          </a>
          <a href="\${props.secondaryButtonUrl}" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors">
            \${props.secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  \`,
  defaultProps: {
    title: 'Ready to Start?',
    description: 'Join us today and start building amazing things',
    primaryButtonText: 'Get Started',
    primaryButtonUrl: '#',
    secondaryButtonText: 'Learn More',
    secondaryButtonUrl: '#'
  }
}
`,
    'components/CustomFooter.mjs': `
export default {
  render: (props) => \`
    <footer class="bg-gray-800 text-white py-12">
      <div class="text-center">
        <p class="text-lg font-semibold mb-4">\${props.companyName}</p>
        <nav class="space-x-6">
          \${props.links.map(link => \`
            <a href="\${link.url}" class="text-gray-300 hover:text-white transition-colors">
              \${link.text}
            </a>
          \`).join('')}
        </nav>
        <p class="mt-8 text-gray-400">© \${new Date().getFullYear()} \${props.companyName}. All rights reserved.</p>
      </div>
    </footer>
  \`,
  defaultProps: {
    companyName: 'PaulJS',
    links: [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Contact', url: '/contact' }
    ]
  }
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
  │   └── index.mjs   # Main page
  ├── components/     # Custom components
  │   ├── CustomHero.mjs
  │   ├── CustomCTA.mjs
  │   └── CustomFooter.mjs
  ├── styles/        # Custom styles
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

async function init(): Promise<void> {
  console.log(chalk.bold('\nWelcome to PaulJS! 🚀'));
  console.log('Let\'s create your new landing page project.\n');

  const answers = await inquirer.prompt<ProjectAnswers>([
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
    console.error(chalk.red('Error creating project:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute when run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  init();
}

export {
  createProjectStructure,
  type ProjectAnswers
}; 