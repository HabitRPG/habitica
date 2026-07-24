/* eslint-disable import/no-commonjs */
module.exports = {
  root: true,
  extends: [
    'habitrpg/lib/node',
  ],
  rules: {
    'prefer-regex-literals': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'require-await': 'error',
  },
  overrides: [
    {
      files: ['migrations/**', 'gulp/**'], // Or *.test.js
      rules: {
        'require-await': 'off',
      },
    },
  ],
};
