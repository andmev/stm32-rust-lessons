const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { minify } = require('html-minifier-terser');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const pagesDir = path.join(srcDir, 'pages');
const tempDir = path.join(__dirname, '.temp');

/**
 * Find all CSS files recursively
 */
function findCssFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findCssFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Bundle all CSS files into a single string
 */
function bundleCss() {
  const cssFiles = findCssFiles(srcDir);
  
  // Sort CSS files: global.css first, then others
  cssFiles.sort((a, b) => {
    const aIsGlobal = a.includes('global.css');
    const bIsGlobal = b.includes('global.css');
    if (aIsGlobal && !bIsGlobal) return -1;
    if (!aIsGlobal && bIsGlobal) return 1;
    return a.localeCompare(b);
  });

  // Read and concatenate all CSS files
  let cssContent = '';
  cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
      const content = fs.readFileSync(cssFile, 'utf8');
      cssContent += `\n/* ${path.relative(srcDir, cssFile)} */\n${content}\n`;
    }
  });

  return cssContent;
}

/**
 * Find all TSX files recursively
 */
function findTsxFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Build all HTML pages using esbuild
 */
async function build() {
  // Ensure directories exist
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // Bundle all CSS files
  const cssContent = bundleCss();
  console.log('✓ CSS files bundled');

  const tsxFiles = findTsxFiles(pagesDir);
  if (tsxFiles.length === 0) {
    console.log('No TSX page files found in src/pages/');
    return;
  }

  console.log(`Found ${tsxFiles.length} page(s) to build...`);

  // Build all pages
  const results = await Promise.all(
    tsxFiles.map(async (tsxPath) => {
      try {
        // Build TSX to JS using esbuild
        const tempJsPath = path.join(
          tempDir,
          path.relative(pagesDir, tsxPath).replace(/\.tsx$/, '.js')
        );

        await esbuild.build({
          entryPoints: [tsxPath],
          bundle: true,
          outfile: tempJsPath,
          format: 'cjs',
          platform: 'node',
          target: 'node18',
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
          external: ['fs', 'path'],
          alias: {
            '@': path.join(__dirname, 'src'),
            '@app': path.join(__dirname, 'src/app'),
            '@shared': path.join(__dirname, 'src/shared'),
            '@pages': path.join(__dirname, 'src/pages'),
            '@jsx': path.join(__dirname, 'src/jsx'),
          },
        });

        // Execute compiled code
        delete require.cache[require.resolve(tempJsPath)];
        const { Page } = require(tempJsPath);
        
        if (typeof Page !== 'function') {
          throw new Error(`Page component not found in ${tsxPath}`);
        }

        // Generate and minify HTML
        const htmlString = Page({ cssContent });
        const minified = await minify(htmlString, {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        });

        // Write to dist
        const relativePath = path.relative(pagesDir, tsxPath);
        const htmlPath = relativePath.replace(/\.tsx$/, '.html');
        const outputPath = path.join(distDir, htmlPath);
        
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, minified);
        
        console.log(`✓ Generated ${htmlPath}`);
        return true;
      } catch (error) {
        console.error(`Error processing ${tsxPath}:`, error);
        return false;
      }
    })
  );

  // Cleanup
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const successCount = results.filter(r => r).length;
  if (successCount === tsxFiles.length) {
    console.log(`✓ Successfully built ${successCount} page(s)`);
  } else {
    console.error(`⚠ Built ${successCount}/${tsxFiles.length} page(s)`);
    process.exit(1);
  }
}

if (require.main === module) {
  build().catch(error => {
    console.error('Error building HTML pages:', error);
    process.exit(1);
  });
}

module.exports = { build };
