import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: [],
      project: ['*.{ts,mjs}'],
      ignoreDependencies: ['typescript'],
    },
    'packages/shared': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
    },
    'packages/engine': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
      ignoreDependencies: ['@mayhem/shared'],
    },
    'packages/games/mayhem': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
      ignoreDependencies: ['@mayhem/shared', '@mayhem/engine'],
    },
    'packages/client': {
      entry: ['src/main.ts', 'vite.config.ts'],
      project: ['src/**/*.ts'],
      ignoreDependencies: ['@mayhem/shared'],
    },
    'packages/server': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
      ignoreDependencies: ['@mayhem/engine', '@mayhem/games-mayhem', '@mayhem/shared'],
    },
  },
  ignore: ['**/dist/**'],
  ignoreBinaries: ['vite'],
};

export default config;
