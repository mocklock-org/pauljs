# PaulJS

A modern, flexible framework for building landing pages with TypeScript and ESM support.

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
```

### Try Experimental Features

To use experimental features (currently in wormhole phase):

```bash
npx create-pauljs-app --tag wormhole
```

> Note: We are currently focused on the wormhole experimental phase, which includes our latest alpha features and improvements.

That's it! Just follow the interactive prompts to:
1. Choose your project name and location
2. Set your site title and description
3. Customize your landing page

The CLI will automatically:
1. Create your project directory
2. Set up the file structure
3. Install all dependencies
4. Configure your development environment

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your landing page!

## Project Structure

```
my-landing-page/
├── src/
│   ├── components/     # React components
│   ├── styles/        # Global styles and themes
│   └── pages/         # Page configurations
├── public/            # Static assets
├── pauljs.config.ts   # PaulJS configuration
└── package.json
```

## Configuration

Create a `pauljs.config.ts` file in your project root:

```typescript
import { PaulJSConfig } from 'pauljs';

const config: PaulJSConfig = {
  pages: {
    '/': {
      meta: {
        title: 'My Landing Page',
        description: 'Welcome to my landing page'
      },
      sections: [
        {
          component: {
            name: 'Hero',
            props: {
              title: 'Welcome',
              subtitle: 'Build beautiful landing pages with PaulJS'
            }
          },
          styles: [
            {
              path: './styles/hero.scss',
              type: 'scss'
            }
          ],
          layout: {
            container: 'container mx-auto',
            className: 'py-12'
          }
        }
      ]
    }
  }
};

export default config;
```

## Components

Create React components with TypeScript:

```typescript
import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle }) => (
  <div className="hero">
    <h1>{title}</h1>
    <p>{subtitle}</p>
  </div>
);
```

## Styling

PaulJS supports multiple styling options:

- SCSS modules
- CSS-in-JS
- Tailwind CSS
- CSS Modules

Example SCSS:

```scss
.hero {
  @apply bg-gradient-to-r from-blue-500 to-purple-500;
  
  h1 {
    @apply text-4xl font-bold text-white;
  }
  
  p {
    @apply text-xl text-white opacity-80;
  }
}
```


## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Local Testing

To test the package locally:

```bash
# Create a tarball of the package
npm pack

# Install the package locally in another project
npm install /path/to/pauljs-x.x.x.tgz

# Or link the package for development
npm link              # Run this in the pauljs package directory
npm link pauljs       # Run this in your test project directory

# Unlink when done testing
npm unlink pauljs     # Run this in your test project directory
npm unlink           # Run this in the pauljs package directory
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## License

MIT © 2025 MockLock

