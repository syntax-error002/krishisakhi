const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase v11+ uses .cjs and .mjs extensions which Metro needs configured to resolve properly
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

module.exports = config;
