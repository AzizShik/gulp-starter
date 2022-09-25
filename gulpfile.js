const gulp = require('gulp');
const { series } = require('gulp');
const { parallel } = require('gulp');
const rename = require('gulp-rename');
const gulpClean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const terser = require('gulp-terser');
const gcmq = require('gulp-group-css-media-queries');
const babel = require('gulp-babel');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');


function watch() {
	browserSync.init({
		server: {
			baseDir: './dist',
		},
	});

	gulp.watch('./src/**/*.html', html);
	gulp.watch('./src/sass/**/*.scss', styles);
	gulp.watch('./src/js/script.js', js);
	gulp.watch('./src/img/**', processImages);
	gulp.watch('./src/img/**', imagesToWebp);
}

function clean() {
	return gulp.src('./dist/*', { read: false }).pipe(gulpClean());
}

function fonts() {
	return gulp
		.src('./src/fonts/*.*')
		.pipe(gulp.dest('./dist/fonts'))
		.pipe(browserSync.stream());
}

function html() {
	return gulp
		.src('./src/index.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('./dist'))
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
		.pipe(gcmq())
		.pipe(rename('main.min.css'))
		.pipe(gulp.dest('./dist/css'))
		.pipe(browserSync.stream());
}

function js() {
	return gulp
		.src('./src/js/*.js')
		.pipe(terser())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(rename('main.min.js'))
		.pipe(gulp.dest('./dist/js'))
		.pipe(browserSync.stream());
}

function processImages() {
	return (
		gulp
			.src('src/img/**')
			.pipe(
				imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ quality: 75, progressive: true }),
					imagemin.optipng({ optimizationLevel: 5 }),
					imagemin.svgo({
						plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
					}),
				])
			)
			.pipe(gulp.dest('dist/img'))
			.pipe(browserSync.stream())
	);
}

function imagesToWebp() {
	return gulp
		.src('src/img/**')
		.pipe(webp())
		.pipe(gulp.dest('dist/img/webp/'))
		.pipe(browserSync.stream());
}

let images = gulp.series(processImages, imagesToWebp);
let build = gulp.parallel(html, js, styles, fonts, images);
let buildWithClean = gulp.series(clean, build);
let dev = gulp.series(buildWithClean, watch);

gulp.task('build', buildWithClean);
gulp.task('dev', dev);
