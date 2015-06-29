var 	gulp	= require('gulp'),
	jshint	= require('gulp-jshint'),
	nodemon	= require('gulp-nodemon'),
	print	= require('gulp-print');

gulp.task('js', function() {
	return gulp.src(['server.js', 'scrape/*.js', 'app/**/*.js'])
	    .pipe(print())
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function() {
	nodemon({
		script: 'server.js',
		ext: 'js'
	});
});

gulp.task('default', ['nodemon']);
