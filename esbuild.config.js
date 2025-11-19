const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

const buildOptions = {
  entryPoints: [path.join(__dirname, 'src/shared/lib/index.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/js/index.js'),
  format: 'iife',
  target: 'es2020',
  minify: isProduction,
  sourcemap: !isProduction,
  platform: 'browser',
  alias: {
    '@': path.join(__dirname, 'src'),
    '@app': path.join(__dirname, 'src/app'),
    '@shared': path.join(__dirname, 'src/shared'),
    '@pages': path.join(__dirname, 'src/pages'),
    '@jsx': path.join(__dirname, 'src/jsx'),
  },
};

async function build() {
  try {
    // Ensure output directory exists
    const outDir = path.dirname(buildOptions.outfile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    await esbuild.build(buildOptions);
    console.log('✓ TypeScript bundled and minified to dist/js/index.js');
  } catch (error) {
    console.error('Error building with esbuild:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  build();
}

module.exports = { build, buildOptions };

