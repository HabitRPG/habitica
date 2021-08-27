/* eslint-disable import/no-commonjs */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'habitrpg/lib/vue',
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // TODO find a way to let eslint understand webpack aliases
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'vue/no-v-html': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
        // Otherwise it results in self closing span(s) and div(s)
        normal: 'never',
        component: 'always',
      },
      svg: 'never',
      math: 'never',
    }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
