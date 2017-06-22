var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	del = require('del');


gulp.task('scripts_domain', function() {
	  return gulp.src('src/domain/**/*.js')
	    .pipe(concat('01_odass_domain.js'))
	    .pipe(gulp.dest('build/js'))
	    .pipe(notify({ message: 'scripts_domain task complete' }));
	});

gulp.task('scripts_angular', function() {
	  return gulp.src('src/app/**/*.js')
	    .pipe(concat('02_odass_angular.js'))
	    .pipe(gulp.dest('build/js'))
	    .pipe(notify({ message: 'scripts_angular task complete' }));
	});

gulp.task('scripts_node', function() {
	  return gulp.src('src/node/*.js')
	    .pipe(concat('03_odass_server.js'))
	    .pipe(gulp.dest('build/js'))
	    .pipe(notify({ message: 'scripts_node task complete' }));
	});


gulp.task('scripts', function() {
	  return gulp.src('build/**/*.js')
	    .pipe(concat('app.js'))
	    .pipe(gulp.dest('dist/assets/js'))
	    .pipe(notify({ message: 'scripts task complete' }));
	});

gulp.task('clean', function() {
	  return del(['build', 'dist/styles', 'dist/scripts', 'dist/images']);
	});

gulp.task('default', ['scripts_domain', 'scripts_angular'], function() {
	gulp.start('scripts');
});

//Watch
gulp.task('watch', function() {

  // Watch .js files
  gulp.watch('src/**/*.js', ['default']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});
