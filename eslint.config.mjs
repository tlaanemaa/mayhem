// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      'eslint.config.mjs',
      'knip.config.ts',
    ],
  },

  // JS recommended for JS/MJS files
  js.configs.recommended,

  // TypeScript strict + stylistic (type-aware)
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // SonarJS quality rules (includes cognitive complexity)
  sonarjs.configs.recommended,

  // Unicorn strictness
  unicorn.configs['flat/recommended'],

  // Type-aware rules need parserOptions
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Rule overrides
  {
    rules: {
      'sonarjs/cognitive-complexity': ['error', 10],

      // Keep common abbreviations used throughout the codebase
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            req: false,
            res: false,
            err: false,
            src: false,
            dist: false,
            env: false,
            ref: false,
            params: false,
            props: false,
          },
        },
      ],

      // Allow index.ts barrel filenames
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true },
          ignore: [/^index\.ts$/, /^main\.ts$/],
        },
      ],

      // Warn rather than error on process.exit (server entry point needs it)
      'unicorn/no-process-exit': 'warn',
    },
  },

  // Server-side packages — projectService resolves their tsconfigs automatically
  {
    files: [
      'packages/shared/src/**/*.ts',
      'packages/engine/src/**/*.ts',
      'packages/games/mayhem/src/**/*.ts',
      'packages/server/src/**/*.ts',
    ],
  },

  // Client — projectService resolves the client tsconfig automatically
  {
    files: ['packages/client/src/**/*.ts', 'packages/client/vite.config.ts'],
  },
);
