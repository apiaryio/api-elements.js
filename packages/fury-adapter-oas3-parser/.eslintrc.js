module.exports = {
  extends: 'airbnb-base',
  env: {
    'browser': true,
    'mocha': true,
    'node': true
  },
  rules: {
    'max-len': 'off',
    'no-shadow': 'off', // FIXME
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'functions': 'never',
    }],
  }
};
