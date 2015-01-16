var gulp = require('gulp'),
    gutil = require('gulp-util'),
    bower = require('bower'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    inject = require('gulp-inject'),
    series = require('stream-series'),
    order = require('gulp-order'),
    sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass', 'inject-js']);

gulp.task('inject-js', function () {
  var libSources = gulp.src(['www/lib/js/*.js'], {read: false});
  var mainSources = gulp.src(['www/js/**/*.js'], {read: false})
    .pipe(order(['app.js', '*.js', '**/*.js']));

  return gulp.src('./www/index.html')
    .pipe(inject(
        series(libSources, mainSources),
        {ignorePath: 'www/',
        relative: true}
      )
    )
    .pipe(gulp.dest('./www'));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/app.scss')
    .pipe(sass({outputStyle: 'nested'}))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});
