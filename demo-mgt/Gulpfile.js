'use strict';

var gulp = require('gulp'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  browserify = require('gulp-browserify'),
  concat = require('gulp-concat'),
  clean = require('gulp-clean');

/* minimal server config */
var embedlr = require('gulp-embedlr'),
  refresh = require('gulp-livereload'),
  lrserver = require('tiny-lr')(),
  express = require('express'),
  livereload = require('connect-livereload'),
  livereloadport = 35729,
  serverport = 3000;

// Set up an express server (but not starting it yet)
var server = express();
// Add live reload
server.use(livereload({
  port: livereloadport
}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: 'dist'
  });
});

// Dev task
gulp.task('dev', function() {
  // Start webserver
  server.listen(serverport);
  // Start live reload
  lrserver.listen(livereloadport);
  // Run the watch task, to keep taps on changes
  gulp.run('watch');
});

// JSHint task
gulp.task('lint', function() {
  gulp.src(['./app/*.js', './app/**/*.js'])
    .pipe(jshint())
    // You can look into pretty reporters as well, but that's another story
    .pipe(jshint.reporter('default'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
  gulp.src(['app/app.js'])
    .pipe(browserify({
      insertGlobals: true,
      debug: true
    }))
    // Bundle to a single file
    .pipe(concat('app.js'))
    // Output it to our dist folder
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(refresh(lrserver));
});

// Views task
gulp.task('views', function() {
  // Get our index.html
  gulp.src('./index.html')
    // And put it in the dist folder
    .pipe(gulp.dest('dist/'));

  // Any other view files from app/views
  gulp.src('./views/**/*')
    // Will be put in the dist/views folder
    .pipe(gulp.dest('dist/views/'));

  gulp.src('./assets/**/*')
    .pipe(gulp.dest('dist/assets/'))
    .pipe(refresh(lrserver));
});


gulp.task('watch', ['lint', 'browserify', 'views'], function() {
  // Watch our scripts
  gulp.watch(['!app/*.min.js','app/*.js', 'app/**/*.js'], [
    'lint',
    'browserify'
  ]);

  gulp.watch(['assets/css/*.css', 'views/**/*', 'index.html'], ['views']);
});
