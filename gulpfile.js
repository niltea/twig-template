'use strict';
// settings
const $dist = './dist/';

// twigテンプレートのベースディレクトリ
const $twigBase = './src/twig/';
const $twigSrc = ['./src/twig/**/*.twig', './src/twig/**/*.html'];
const $twigSrc_exclude = ['!**/_*.twig', '!**/_*.html'];

// twigコンパイル時に持たせておくデーター
const $twig_output_data = {};

// プレビュー表示用HTMLの生成先
const $htmlRoot = '__html/';

// for optional task
// SASS source file
const $cssSrc = ['./src/sass/**/*.scss', './src/sass/**/*.sass'];
const $cssDist = $dist + 'css/';
// JS source file
const $jsSrc = ['./src/js/**/*.js'];
const $jsDist = $dist + 'js/';

// tasks
const gulp = require('gulp');
const plumber = require('gulp-plumber');

gulp.task('twig', () => {
	const twig = require('gulp-twig');
	const _twigSrc = $twigSrc.concat($twigSrc_exclude);
	const _htmlRoot = $htmlRoot.replace(/\/$/, '');
	const _htmlDist = $dist + _htmlRoot;
	gulp.src(_twigSrc)
	.pipe(plumber())
	.pipe(twig({
		data: $twig_output_data,
		base: $twigBase
	}))
	.pipe(gulp.dest(_htmlDist));

	// twigテンプレートをdistへコピー
	gulp.src($twigSrc).pipe(gulp.dest($dist));
});

gulp.task('server', () => {
	const browserSync = require('browser-sync');
	const _htmlRoot = '/' + $htmlRoot;
	browserSync({
		server: {
			baseDir: $dist,
			directory: false
		},
		middleware: (req, res, next) => {
			if (req.url.match(/\/$/)) {
				req.url = _htmlRoot + req.url.match(/(.*)\/$/)[1] + '/';
			} else if (req.url.match(/html?$/)) {
				req.url = _htmlRoot + req.url;
			}
			return next();
		}
	});

	gulp.watch(`${$dist}**/*.css`).on('change', browserSync.stream);
	gulp.watch(`${$dist}**/*.html`).on('change', browserSync.reload);
});

gulp.task('watch', () => {
	gulp.watch($jsSrc, ['js']);
	gulp.watch($cssSrc, ['sass']);
	gulp.watch($twigSrc, ['twig']);
});

gulp.task('default', ['server', 'watch']);

// optional tasks
// sass
gulp.task('sass', () => {
	const sass = require('gulp-sass');
	const postcss = require('gulp-postcss');
	const autoprefixer = require('autoprefixer')

	gulp.src($cssSrc)
	.pipe(plumber())
	// .pipe(sass({outputStyle: 'compressed'}))
	.pipe(sass({outputStyle: 'expanded'}))
	.pipe(postcss([
		autoprefixer({
			browsers: ['last 2 versions', 'ie >= 9', 'Android >= 4','ios_saf >= 8'],
			cascade: false
		})
	]))
	.pipe(gulp.dest($cssDist));
});

// js
gulp.task('js', () => {
	const babel = require('gulp-babel');
	const uglify = require("gulp-uglify");
	gulp.src($jsSrc)
	.pipe(plumber())
	.pipe(babel({
		presets: ['es2015'],
		comments: false
	}))
	.pipe(uglify())
	.pipe(gulp.dest($jsDist));
});