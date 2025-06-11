# PaulJS

A lightweight framework for building fast landing pages. PaulJS provides modular, reusable components that can be used standalone or integrated with popular JavaScript frameworks like React.

## Features

- **Fast & Lightweight**: Optimized for performance and quick loading times
- **Modular Components**: Pre-built, customizable components for common landing page sections
- **Framework Agnostic**: Use standalone or integrate with React (more frameworks coming soon)
- **Responsive Design**: Mobile-first components that look great on all devices
- **Customizable**: Easy to style and modify to match your brand
- **CLI Tools**: Quick scaffolding for new landing pages

## Installation
```bash
npm install pauljs
```

## Quick Start

1. Create a new landing page:
   ```bash
   npx pauljs init
   ```

2. Add individual components:
   ```bash
   npx pauljs add hero
   npx pauljs add cta
   npx pauljs add footer
   ```

## Using Components

### Vanilla JavaScript/HTML

```javascript
const { components } = require('pauljs');

// Render a hero section
const heroHtml = components.hero.render({
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
components.hero.render({
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
components.cta.render({
  title: 'Ready to Start?',
  description: 'Join thousands of developers...',
  primaryButtonText: 'Get Started',
  primaryButtonUrl: '/signup',
  secondaryButtonText: 'Learn More',
  secondaryButtonUrl: '/docs'
});
```

### Footer
```javascript
components.footer.render({
  companyName: 'Your Company',
  links: [
    { text: 'About', url: '/about' },
    { text: 'Contact', url: '/contact' }
  ]
});
```

## Customization

All components accept style overrides through props:

```javascript
components.hero.render({
  backgroundColor: '#000',
  textColor: '#fff',
  // ... other props
});
```
## License

MIT © 2025 MockLock

