
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
  title: 'My Landing Page',
  description: 'A beautiful landing page built with PaulJS',
  
  // Use custom components
  hero: CustomHero({
    title: 'My Landing Page',
    subtitle: 'A beautiful landing page built with PaulJS',
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
    companyName: 'My Landing Page',
    links: [
      { text: 'About', url: '/about' },
      { text: 'Features', url: '#features' },
      { text: 'Contact', url: '#contact' }
    ]
  })
});

module.exports = app;
