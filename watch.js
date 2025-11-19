const esbuild = require('esbuild');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { buildOptions } = require('./esbuild.config.js');
const { build: buildHtml } = require('./esbuild.html.config.js');
const { exec } = require('child_process');
const liveServer = require('live-server');

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function copyAssets() {
  exec('npm run build:assets', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error copying assets: ${error}`);
      return;
    }
    console.log('✓ Assets copied');
  });
}

async function startWatch() {
  console.log('Starting watch mode with live-server...');

  // 1. Initial Build
  console.log('Running initial build...');
  await buildHtml();
  copyAssets();

  // 2. Watch JS/TS files with esbuild context
  try {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('✓ Watching JS/TS files (esbuild)');
  } catch (error) {
    console.error('Error starting esbuild watch:', error);
    process.exit(1);
  }

  // 3. Watch HTML/CSS/TSX for HTML build
  // Watch the entire src directory recursively
  const srcPath = path.resolve(__dirname, 'src');
  console.log(`Watching directory: ${srcPath}`);
  
  const watcher = chokidar.watch(srcPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
    depth: 99
  });

  let isBuilding = false;
  let buildPending = false;

  const runBuildHtml = async () => {
    if (isBuilding) {
      buildPending = true;
      return;
    }

    isBuilding = true;
    console.log('File changed, rebuilding HTML...');
    
    try {
      await buildHtml();
    } catch (error) {
      console.error('Error rebuilding HTML:', error);
    } finally {
      isBuilding = false;
      if (buildPending) {
        buildPending = false;
        runBuildHtml();
      }
    }
  };

  const debouncedBuildHtml = debounce(runBuildHtml, 200);

  const debouncedCopyAssets = debounce(() => {
    console.log('Asset changed, copying...');
    copyAssets();
  }, 500);

  watcher.on('all', (event, filePath) => {
    console.log(`[Watch] Event: ${event}, Path: ${filePath}`);
    
    if (filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
      debouncedBuildHtml();
    } else if (filePath.includes('/assets/')) {
      debouncedCopyAssets();
    }
  });
  
  console.log('✓ Watching src directory for changes');

  // 4. Start Live Server (last to ensure watchers are set up)
  const params = {
    port: 8080,
    root: "dist",
    open: true,
    file: "index.html",
    wait: 500,
    logLevel: 2,
  };
  
  console.log('Starting live-server...');
  liveServer.start(params);
}

startWatch();
