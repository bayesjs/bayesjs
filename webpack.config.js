const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/index'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bayes.js',
    library: 'bayesjs',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/
      }
    ]
  }
};
