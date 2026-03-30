import reactCompiler from 'eslint-plugin-react-compiler';
import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.recommended, {
  name: 'react-compiler/recommended',
  files: ['frontend/**/*.{ts,tsx,js,jsx}'],
  plugins: {
    'react-compiler': reactCompiler,
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    // Disable TypeScript rules that might conflict
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
