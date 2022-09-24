const gulp = require('gulp');
const { series } = require('gulp');
const { parallel } = require('gulp');
const rename = require('gulp-rename');
const gulpClean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');

function watch() {
	browserSync.init({
		server: {
			baseDir: './build',
		},
	});

	gulp.watch('./src/**/*.html', html);
	gulp.watch('./src/sass/**/*.scss', styles);
	gulp.watch('./src/js/script.js', js);
}

function clean() {
	return gulp.src('./build/*', { read: false }).pipe(gulpClean());
}

function fonts() {
	return gulp.src('./src/fonts/*.*').pipe(gulp.dest('./build/fonts'));
}

function html() {
	return gulp
		.src('./src/index.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('./build'))
		.pipe(browserSync.stream());
}

function styles() {
	return gulp
		.src('./src/sass/*.scss')
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 versions'],
				grid: true,
			})
		)
		.pipe(rename('main.min.css'))
		.pipe(gulp.dest('./build/css'))
		.pipe(browserSync.stream());
}

function js() {
	return gulp
		.src('./src/js/*.js')
    .pipe(rename('main.min.js'))
		.pipe(gulp.dest('./build/js'))
		.pipe(browserSync.stream());
}

let build = gulp.parallel(html, js, styles, fonts);
let buildWithClean = gulp.series(clean, build);
let dev = gulp.series(buildWithClean, watch);

gulp.task('build', buildWithClean);
gulp.task('dev', dev);
