'use strict';
// settings
const $dist = './dist/';
const $twigSrc = ['./src/twig/**/*.twig', './src/twig/**/*.html'];
const $twigSrc_exclude = ['!./src/twig/**/_*.twig', '!./src/twig/**/_*.html'];

// twigコンパイル時に持たせておくデーター
const $twig_output_data = {};

// プレビュー表示用HTMLの生成先
const $htmlRoot = '__html/';

// tasks
const gulp = require('gulp');
const plumber = require('gulp-plumber');
gulp.task('twig', () => {
	const twig = require('gulp-twig');
	const _twigSrc = $twigSrc.concat($twigSrc_exclude);
	const _twigDist = $dist + $htmlRoot;
	gulp.src( _twigSrc )
	.pipe(plumber())
	.pipe(twig({
		data: $twig_output_data
	}))
	.pipe(gulp.dest(_twigDist));

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
			if (req.url === '/') {
				req.url = _htmlRoot;
			}
			if (req.url === '/hoge') {
				req.url = _htmlRoot + 'hoge.html';
			}
			return next();
		}
	});

	gulp.watch(`${$dist}**/*.css`).on('change', browserSync.stream);
	gulp.watch(`${$dist}**/*.html`).on('change', browserSync.reload);
});

gulp.task('watch', () => {
	gulp.watch($twigSrc, ['twig']);
});

gulp.task('default', ['server', 'watch']);