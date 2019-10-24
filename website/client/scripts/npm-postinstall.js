const { execSync } = require('child_process');

if (process.env.NODE_ENV === 'production') {
  execSync('npm run build');
}
