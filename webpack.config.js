var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, 'src/BayesianNetwork.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bayes.js',
    library: 'bayesjs',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  }
};
