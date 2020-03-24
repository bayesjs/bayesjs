const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/index'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bayes.js',
    library: 'bayesjs',
    libraryTarget: 'umd',
    globalObject: `typeof self !== 'undefined' ? self : this`,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
