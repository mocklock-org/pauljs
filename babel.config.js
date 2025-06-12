module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ]
}; 