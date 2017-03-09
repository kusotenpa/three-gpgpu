import gulp from 'gulp'
import webpack from 'webpack'
import config from '../webpack.config.babel'
import runSequence from 'run-sequence'

gulp.task('buildWebpack', cb => {
  webpack(config, (err, stats) => {
    if (err) {
      console.error(err, stats)
    }
    cb && cb()
  })
})

gulp.task('buildHtml', () => {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('build/'))
})

gulp.task('build', cb => {
  runSequence(
    [
      'buildWebpack',
      'buildHtml',
    ],
    cb
  )
})
