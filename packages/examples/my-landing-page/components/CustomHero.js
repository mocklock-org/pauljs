
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomHero(props) {
  return components.hero(Object.assign({}, props, {
    backgroundColor: '#f7fafc',
    textColor: '#2d3748',
    // Add any custom styling or behavior
  }));
}

module.exports = CustomHero;
