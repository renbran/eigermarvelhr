const { execSync } = require('child_process');

try {
  execSync('eslint --fix .');
  execSync('prettier --write .');
  console.log('Pre-commit hook completed successfully.');
} catch (error) {
  console.error('Pre-commit hook failed:', error.message);
  process.exit(1);
}