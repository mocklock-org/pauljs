
const pauljs = require('pauljs');
const { components } = pauljs;

function CustomFooter(props) {
  return components.footer({
    ...props,
    backgroundColor: '#2d3748',
    textColor: '#f7fafc',
    // Add any custom styling or behavior
  });
}

module.exports = CustomFooter;
