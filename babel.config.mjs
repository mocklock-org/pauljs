export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ]
}; 