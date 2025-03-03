const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, './functions');
const exportedModules = {};

function loadModules(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.lstatSync(fullPath).isDirectory()) { loadModules(fullPath); }
    else if (file.endsWith('.js')) {
      try {
        const moduleName = path.parse(file).name;
        const modulePath = path.join(directory, file);
        const loadedModule = require(modulePath);

        // Check if module.exports is an object (expected named export)
        if (typeof loadedModule === 'object' && loadedModule[moduleName]) {
          exportedModules[moduleName] = loadedModule[moduleName];
        }
        // If module.exports is a function, assign directly
        else if (typeof loadedModule === 'function') {
          exportedModules[moduleName] = loadedModule;
        }
        else {
          console.warn(`Module ${file} does not export a matching function. Skipping.`);
        }

        console.log(`Loaded Module: ${moduleName}`);
      }
      catch (error) {
        console.error(`Failed to load module ${file}: ${error.message}`);
      }
    }
  });
}

loadModules(folderPath);

module.exports = exportedModules;