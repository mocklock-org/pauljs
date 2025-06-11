
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomCTA(props) {
  return components.cta({
    ...props,
    backgroundColor: '#edf2f7',
    textColor: '#2d3748',
    // Add any custom styling or behavior
  });
}

module.exports = CustomCTA;
