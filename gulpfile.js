var 	gulp	= require('gulp'),
	jshint	= require('gulp-jshint'),
	print	= require('gulp-print');

gulp.task('js', function() {
	return gulp.src(['server.js', 'app/**/*.js'])
	    .pipe(print())
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});
