#!/usr/bin/env node

const { program } = require('commander');
const { generatePage, addComponent } = require('../src/index');
const path = require('path');

program
  .version('1.0.0')
  .description('PaulJS: A lightweight framework for building fast landing pages');

program
  .command('init')
  .description('Initialize a new landing page')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(async (options) => {
    try {
      await generatePage(options.template);
      console.log('✨ New landing page initialized successfully!');
    } catch (err) {
      console.error('❌ Error generating page:', err.message);
      process.exit(1);
    }
  });

program
  .command('add <component>')
  .description('Add a component (hero, cta, footer)')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action(async (component, options) => {
    try {
      await addComponent(component, options.output);
      console.log(`✨ Added ${component} component successfully!`);
    } catch (err) {
      console.error('❌ Error adding component:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv); 