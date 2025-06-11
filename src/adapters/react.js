const babel = require('@babel/core');

function convertToReactComponent(paulComponent, props = {}) {
  const componentCode = paulComponent.react(props).component(props);
  
  // Convert the string component to a valid React component
  const babelOptions = {
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-syntax-jsx']
  };

  try {
    const { code } = babel.transformSync(`
      const React = require('react');
      
      function PaulJSComponent(props) {
        ${componentCode}
      }
      
      module.exports = PaulJSComponent;
    `, babelOptions);

    return code;
  } catch (error) {
    throw new Error(`Error converting component to React: ${error.message}`);
  }
}

module.exports = {
  convertToReactComponent
}; 