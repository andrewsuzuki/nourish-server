var 	gulp	= require('gulp'),
	jshint	= require('gulp-jshint'),
	nodemon	= require('gulp-nodemon'),
	print	= require('gulp-print');

gulp.task('js', function() {
	return gulp.src(['server.js', 'scrape/*.js', 'setup/*.js', 'app/**/*.js'])
	    .pipe(print())
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('wipe', function() {
	require('./setup/wipe')();
});

gulp.task('create-halls', function() {
	require('./setup/create-halls')();
});

gulp.task('scrape', function() {
	nodemon({
		script: 'scrape/scraper.js',
		ext: 'js'
	});
});

gulp.task('nodemon', function() {
	nodemon({
		script: 'server.js',
		ext: 'js',
		env: { 'NOSCRAPE': 'true' }
	});
});

gulp.task('default', ['nodemon']);
