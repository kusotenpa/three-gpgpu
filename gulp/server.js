import gulp from 'gulp'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import webpackConfig from '../webpack.config.babel'

gulp.task('serve', cb => {
  const config = Object.create(webpackConfig)
  const compiler = webpack(config)
  new WebpackDevServer(compiler, config.devServer)
    .listen(8080, 'localhost', () => cb())
})
