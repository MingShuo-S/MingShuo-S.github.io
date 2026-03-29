import * as esbuild from 'esbuild';

const production = process.argv.includes('production');

export default esbuild.build({
  entryPoints: ['main.ts'],
  outfile: 'main.js',
  bundle: true,
  platform: 'node',
  target: 'node16',
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/closebrackets',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/comment',
    '@codemirror/fold',
    '@codemirror/highlight',
    '@codemirror/history',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/matchbrackets',
    '@codemirror/panel',
    '@codemirror/range-set',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/stream-parser',
    '@codemirror/text',
    '@codemirror/tooltip',
    '@codemirror/view'
  ],
  plugins: [],
  minify: production,
  sourcemap: production ? false : 'inline',
  define: {
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
  },
  logLevel: 'info',
});