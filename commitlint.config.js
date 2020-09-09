module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'project',
      'core',
      'cli',
      'oas3',
      'oas2',
      'apib',
      'apiaryb',
      'remote',
      'form',
      'json',
      'text',
      'deps',
      'deps-dev',
    ]],
    'scope-empty': [2, 'never'],
  },
};
