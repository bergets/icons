var gulp = require('gulp'),
  svgSprite = require('gulp-svg-sprite'),
  plumber = require('gulp-plumber'),
  inject = require('gulp-inject'),
  runSequence = require('run-sequence'),
  browserSync = require('browser-sync').create();

var siteDir = './dist/'

var paths = {
  html:{
    index: './src/index.html',
    dist: './dist/'
  },
  svg: {
    app: './src/icn/**/*.svg',
    dist: './dist/svg',
    sprite: 'sprite.svg'
  },
}

var svgConfig                  = {
  shape: {
    dest: "intermediate-svg",
  },
  mode                    : {
      dest: "",
      inline              : true,
      symbol              : {
        dest: "",
        sprite: paths.svg.sprite,
      }
  }
};

gulp.task('build:svg:symbol', function(){
  return gulp.src(paths.svg.app)
    .pipe(plumber())
    .pipe(svgSprite(svgConfig)).on('error', function(error){ console.log("error"); })
    .pipe(gulp.dest(paths.svg.dist));
});

gulp.task('build:svg:inject', function(){
  var svgs = gulp
    .src('./dist/svg/sprite.svg')

  function fileContents (filePath, file) {
        return file.contents.toString();
    }

  return gulp.src(paths.html.index)
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest(paths.html.dist));
});

gulp.task('build:svg', function(cb) {
  runSequence('build:svg:symbol', 'build:svg:inject',
              cb);
});

gulp.task('build:svg:watch', ['build:svg'], function(cb) {
  browserSync.reload();
  cb();
});

gulp.task('build:svg:inject:watch', ['build:svg:inject'], function(cb) {
  browserSync.reload();
  cb();
});

gulp.task('build', function(cb) {
  runSequence(['build:svg', 'build:svg:inject'],
              cb);
});

gulp.task('serve', ['build'], function() {

  browserSync.init({
    server: siteDir,
    ghostMode: false, // do not mirror clicks, reloads, etc. (performance optimization)
    logFileChanges: true,
    open: false       // do not open the browser (annoying)
  });

  // Watch SVG
  gulp.watch(['src/icn/**.*.svg', 'src/icn/*.svg'], ['build:svg:watch']);

  // Watch Inject SVG
  gulp.watch(['src/index.html', 'src/icn/**.*.svg'], ['build:svg:inject:watch']);

});
