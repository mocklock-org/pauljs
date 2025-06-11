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

## Installation
```bash
npm install -g pauljs
```

## Quick Start

1. Create a new project:
```bash
pauljs create my-landing-page
cd my-landing-page
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
my-landing-page/
  ├── pages/
  │   └── index.js      # Main page configuration
  ├── public/           # Static assets (images, etc.)
  ├── package.json
  └── node_modules/
```

## Creating Pages

```javascript
// pages/index.js
const pauljs = require('pauljs');
const app = pauljs.createApp();

// Create home page
app.createPage('/', {
  title: 'Welcome',
  description: 'My awesome landing page',
  hero: {
    title: 'Welcome to My Site',
    subtitle: 'The best landing page ever',
    ctaText: 'Get Started',
    ctaUrl: '#signup'
  },
  cta: {
    title: 'Ready to Start?',
    description: 'Join us today!',
    primaryButtonText: 'Sign Up',
    primaryButtonUrl: '/signup'
  }
});

// Create additional pages
app.createPage('/about', {
  title: 'About Us',
  // ... component configurations
});

module.exports = app;
```

## Using Components

### Vanilla JavaScript/HTML

```javascript
const { components } = require('pauljs');

// Render a hero section
const heroHtml = components.hero({
  title: 'Welcome to My Site',
  subtitle: 'Build amazing landing pages quickly',
  ctaText: 'Get Started',
  ctaUrl: '/signup'
});
```

### React Integration

```javascript
const { components, adapters } = require('pauljs');
const { convertToReactComponent } = adapters.react;

// Convert a PaulJS component to a React component
const HeroComponent = convertToReactComponent(components.hero, {
  title: 'Welcome to My Site',
  subtitle: 'Build amazing landing pages quickly',
  ctaText: 'Get Started',
  ctaUrl: '/signup'
});

// Use in your React app
function App() {
  return (
    <div>
      <HeroComponent />
    </div>
  );
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

## Development Commands

- `npm run dev` - Start development server with hot reloading
- `npm start` - Start production server
- `npm run build` - Build static site for production

## Customization

All components accept style overrides through props:

```javascript
components.hero({
  backgroundColor: '#000',
  textColor: '#fff',
  // ... other props
});
```

## License

MIT © 2025 MockLock

