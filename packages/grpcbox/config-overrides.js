/* config-overrides.js */
// https://github.com/timarney/react-app-rewired

module.exports = function override(config, env) {
    // Module not found: Can't resolve 'http2' になるため、上書き
    config.target = 'electron-renderer'
    return config;
}