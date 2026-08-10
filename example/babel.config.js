module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['E2E_TEST', 'BENCHMARK']
      }
    ]
  ]
};
