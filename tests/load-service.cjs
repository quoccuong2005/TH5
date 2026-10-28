const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { transformSync } = require('@babel/core');
// Run the same JS service source in Node, injecting only the Firebase connection.
module.exports = function loadService(name, overrides = {}) {
  const filename = path.resolve(__dirname, '../src/services', name + '.js');
  const source = transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false, configFile: false,
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  }).code;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = id => Object.hasOwn(overrides, id) ? overrides[id] : originalRequire(id);
  loaded._compile(source, filename);
  return loaded.exports;
};
