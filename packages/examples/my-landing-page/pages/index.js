
const pauljs = require('pauljs');
const app = pauljs.createApp();

app.createPage('/', {
  title: 'Dow Jones',
  description: 'A beautiful landing page built with PaulJS',
  hero: {
    title: 'Dow Jones',
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
