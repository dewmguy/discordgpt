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
        exportedModules[moduleName] = require(modulePath)[moduleName];
        console.log(`Loaded Module: ${moduleName}`);
      }
      catch (error) { console.error(`Failed to load module ${file}: ${error.message}`); }
    }
  });
}

loadModules(folderPath);

module.exports = exportedModules;