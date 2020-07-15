module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          node: '12.18.0',
          esmodules: true
        }
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-transform-runtime',
    'babel-plugin-rewire'
  ]
};
