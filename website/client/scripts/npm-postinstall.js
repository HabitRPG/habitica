/* eslint-disable import/no-commonjs */

const { execSync } = require('child_process');

if (process.env.NODE_ENV === 'production') {
  execSync('npm run build', {
    stdio: 'inherit',
  });

  /* execSync('npm run storybook:build', {
    stdio: 'inherit',
  }); */
}
