// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable support for dynamic imports and web
config.resolver.sourceExts.push('web.ts', 'web.tsx', 'web.js', 'web.jsx');
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

