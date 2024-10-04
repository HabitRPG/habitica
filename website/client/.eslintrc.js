/* eslint-disable import/no-commonjs */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'habitrpg/lib/vue',
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // TODO find a way to let eslint understand webpack aliases
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'prefer-regex-literals': 'warn',
    'vue/no-v-html': 'off',
    'vue/no-mutating-props': 'warn',
    // this creates issues with the current way we have to push the process.env vars to webpack
    // https://github.com/eslint/eslint/issues/14918
    // https://github.com/webpack/webpack/issues/5392
    // off for now, because any eslint --fix will then still do it anyway
    // maybe this can be turned on again once we switch to newer vue/vite
    // Important! process.env.XYZ should not be destructured
    'prefer-destructuring': 'off',
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
    'vue/component-tags-order': ['warn', {
      order: ['template', 'style', 'script'],
    }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
