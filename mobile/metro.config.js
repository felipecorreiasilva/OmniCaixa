const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Aponta para o global.css dentro da pasta src
module.exports = withNativeWind(config, { input: './src/global.css' });