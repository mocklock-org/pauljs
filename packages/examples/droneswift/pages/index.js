
const pauljs = require('pauljs');
const app = pauljs.createApp();

app.createPage('/', {
  title: 'My Landing Page',
  description: 'A beautiful landing page built with PaulJS',
  hero: {
    title: 'My Landing Page',
    subtitle: 'A beautiful landing page built with PaulJS',
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
