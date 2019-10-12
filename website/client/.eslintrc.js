module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'habitrpg/lib/vue',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/no-unresolved': 'off',
    'vue/no-v-html': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
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
