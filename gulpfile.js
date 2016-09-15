var gulp = require('gulp'),
  svgSprite = require('gulp-svg-sprite'),
  plumber = require('gulp-plumber'),
  inject = require('gulp-inject'),
  runSequence = require('run-sequence'),
  svgmin = require('gulp-svgmin'),
  del = require('del'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  customProperties = require("postcss-custom-properties"),
  nested = require("postcss-nested"),
  easyImport = require("postcss-easy-import"),
  browserSync = require('browser-sync').create();

var siteDir = './'

var paths = {
  html:{
    index: './src/index.html',
    out: './'
  },
  svg: {
    app: './src/icn/**/*.svg',
    dist: './dist/',
    icons: 'icons/',
    sprite: 'sprite.svg'
  },
  css: {
    app: './src/style.css',
    out: './',
  },
}

var svgConfig                  = {
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
    .src(paths.svg.dist + paths.svg.sprite)

  function fileContents (filePath, file) {
        return file.contents.toString();
    }

  return gulp.src(paths.html.index)
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest(paths.html.out));
});

gulp.task('build:svg:min', function () {
    return gulp.src(paths.svg.app)
        .pipe(svgmin())
        .pipe(gulp.dest(paths.svg.dist + paths.svg.icons));
});

gulp.task('build:styles', function() {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    easyImport,
    customProperties,
    nested,
    cssnano
];
  return gulp.src(paths.css.app)
    .pipe(postcss(processors))
    .pipe(gulp.dest(paths.css.out))
});

gulp.task('clean', function () {
  return del([
    'dist/**/*',
  ]);
});


// Task for creating svg symbols and svg symbols minified, smallest task when only wanting icons
gulp.task('build', function(cb) {
  runSequence(['build:svg:symbol', 'build:svg:min'],
              cb);
});

// Task to delete content in dist folder and creating everything from scratch, remove old files
gulp.task('production', function(cb) {
  runSequence('clean',['build:svg:symbol', 'build:svg:min', 'build:styles'], 'build:svg:inject',
              cb);
});

// Task for creating svg symbols and styles and index.html, used with serve
gulp.task('build:svg', function(cb) {
  runSequence(['build:svg:symbol', 'build:styles'], 'build:svg:inject',
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

gulp.task('build:styles:watch', ['build:styles'], function(cb) {
  browserSync.reload();
  cb();
});


gulp.task('serve', ['build:svg'], function() {

  browserSync.init({
    server: siteDir,
    ghostMode: false, // do not mirror clicks, reloads, etc. (performance optimization)
    logFileChanges: true,
    open: false       // do not open the browser (annoying)
  });

  // Watch SVG
  gulp.watch(['src/icn/**.*.svg', 'src/icn/*.svg'], ['build:svg:watch']);

  // Watch index.html html and inject SVG
  gulp.watch(['src/index.html', 'src/icn/**.*.svg'], ['build:svg:inject:watch']);

  // Watch css html and inject SVG
  gulp.watch(['src/*.css', 'src/icn/**.*.css'], ['build:styles:watch']);

});
