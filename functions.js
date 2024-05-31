const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, './functions');
const exportedModules = {};

fs.readdirSync(folderPath).forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const moduleName = path.parse(file).name;
      const modulePath = path.join(folderPath, file);
      exportedModules[moduleName] = require(modulePath)[moduleName];
      console.log(`Loaded Module: ${moduleName}`);
    }
    catch (error) { console.error(`Failed to load module ${file}: ${error.message}`); }
  }
});

module.exports = exportedModules;

/**
 * This file exports all the functions in the `functions` directory. It reads the contents of the `functions` directory,
 * filters out any files that do not end with `.js`, and tries to require each file. It expects that each file exports a
 * function with the same name as the file. It then assigns the exported function to a property of the `exportedModules`
 * object with the same name as the file.
 * If there is an error loading a module, it logs an error message to the console.
 * The final line exports the `exportedModules` object, which can be imported and used in other files.
 */