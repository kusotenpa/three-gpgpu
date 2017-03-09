const path = require('path')
const webpack = require('webpack')
// const PROD = (process.env.NODE_ENV === 'production')
// if (PROD) {
//   plugins.push(new webpack.optimize.UglifyJsPlugin())
// }

module.exports = {
  entry: {
    app: [
      // path.join(__dirname, 'src/js/index.js'),
      './src/js/index.js',
      'webpack-dev-server/client?http://localhost:8080',
      // 'webpack/hot/dev-server',
    ],
  },
  output: {
    path: path.join(__dirname, 'build/js'),
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
    publicPath: '/js/',
  },
  devtool: '#source-map',
  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel?cacheDirectory=true',
        babelrc: true,
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    port: 8080,
    // hot: true,
    inline: true,
    publicPath: '/js/',
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    extensions: [ '', '.js' ],
  },
}
