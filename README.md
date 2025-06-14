# PaulJS

A lightweight framework for building fast landing pages. PaulJS provides modular, reusable components that can be used standalone or integrated with popular JavaScript frameworks like React.

## Features

- **Fast & Lightweight**: Optimized for performance and quick loading times
- **Modular Components**: Pre-built, customizable components for common landing page sections
- **Framework Agnostic**: Use standalone or integrate with React (more frameworks coming soon)
- **Responsive Design**: Mobile-first components that look great on all devices
- **Customizable**: Easy to style and modify to match your brand
- **Built-in Server**: Development server with hot reloading
- **Static Export**: Generate static HTML for production
- **Routing Support**: Create multi-page landing sites easily

## Quick Start

Create a new project with a single command:

```bash
npx create-pauljs-app

### Try experimental features
npm install pauljs@wormhole
```

That's it! Just follow the interactive prompts to:
1. Choose your project name and location
2. Set your site title and description
3. Customize your landing page

The CLI will automatically:
1. Create your project directory
2. Set up the file structure
3. Install all dependencies
4. Configure your development environment

Once created, you can start developing:
```bash
cd my-landing-page  # Or your chosen project name
npm run dev         # Start development server
```

Visit `http://localhost:3000` to see your landing page!

## Project Structure

When you create a new PaulJS project, it comes with the following structure:

```
my-landing-page/
  ├── pages/          # Page configurations
  │   └── index.js    # Main page
  ├── components/     # Custom components
  │   ├── CustomHero.js
  │   ├── CustomCTA.js
  │   └── CustomFooter.js
  ├── styles/        # Custom styles
  │   └── main.css   # Global styles and component overrides
  ├── public/        # Static assets (images, fonts, etc.)
  └── package.json
```

### Pages

The `pages` directory contains your page configurations. Each page can have its own layout and components:

```javascript
// pages/index.js
const pauljs = require('pauljs');
const CustomHero = require('../components/CustomHero');

const app = pauljs.createApp();

app.createPage('/', {
  title: 'My Landing Page',
  hero: CustomHero({
    title: 'Welcome',
    subtitle: 'Build amazing landing pages'
  })
});

module.exports = app;
```

### Custom Components

Create custom components by extending PaulJS base components:

```javascript
// components/CustomHero.js
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomHero(props) {
  return components.hero({
    ...props,
    backgroundColor: '#f7fafc',
    textColor: '#2d3748'
  });
}

module.exports = CustomHero;
```

### Styling

Customize your components using CSS:

```css
/* styles/main.css */
:root {
  --primary-color: #3182ce;
  --secondary-color: #2d3748;
}

.pauljs-hero {
  /* Override hero styles */
}

.pauljs-cta {
  /* Override CTA styles */
}
```

## Available Components

### Hero Section
```javascript
components.hero({
  title: 'Your Title',
  subtitle: 'Your subtitle text',
  ctaText: 'Button Text',
  ctaUrl: '/your-link',
  backgroundColor: '#f8f9fa',
  textColor: '#212529'
});
```

### Call to Action (CTA)
```javascript
components.cta({
  title: 'Ready to Start?',
  description: 'Join thousands of users...',
  primaryButtonText: 'Get Started',
  primaryButtonUrl: '/signup',
  secondaryButtonText: 'Learn More',
  secondaryButtonUrl: '/docs'
});
```

### Footer
```javascript
components.footer({
  companyName: 'Your Company',
  links: [
    { text: 'About', url: '/about' },
    { text: 'Contact', url: '/contact' }
  ]
});
```

## React Integration

PaulJS components can be used in React applications:

```javascript
const { components, adapters } = require('pauljs');
const { convertToReactComponent } = adapters.react;

// Convert a PaulJS component to a React component
const HeroComponent = convertToReactComponent(components.hero, {
  title: 'Welcome',
  subtitle: 'Build amazing landing pages'
});
```

## Development Commands

- `npm run dev` - Start development server with hot reloading
- `npm start` - Start production server
- `npm run build` - Build static site for production

## License

MIT © 2025 MockLock

