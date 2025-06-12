const pauljs = require('pauljs');

const app = pauljs.createApp();

app.createPage('/', {
  title: 'My Landing Page',
  hero: pauljs.components.hero({
    title: 'Welcome',
    subtitle: 'Build amazing landing pages'
  }),
  cta: pauljs.components.cta({
    title: 'Ready to Start?',
    description: 'Join thousands of users...',
    primaryButtonText: 'Get Started',
    primaryButtonUrl: '/signup'
  }),
  footer: pauljs.components.footer({
    companyName: 'Test Company',
    links: [
      { text: 'About', url: '/about' },
      { text: 'Contact', url: '/contact' }
    ]
  })
});

module.exports = app; 