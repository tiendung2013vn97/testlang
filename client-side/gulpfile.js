'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-csso');
var babel = require('gulp-babel');
const minify = require('gulp-minify');

var source = 'assets/dev/',
    dest = 'static/client-asset/';


var bootstrapSass = {
    in: './node_modules/bootstrap-sass/',
    new: './node_modules/bootstrap/'
};

// Bootstrap fonts source
var fonts = {
    in: source + 'fonts/*',
    out: dest + 'fonts/'
};

// Our scss source folder: .scss files
var scss = {
    in: source + 'sass/main.scss',
    out: dest + 'css/',
    sassOpts: {
        outputStyle: 'nested',
        precison: 3,
        errLogToConsole: true,
        includePaths: [bootstrapSass.new + 'scss']
    }
};

// Copy bootstrap required fonts to dest
gulp.task('fonts', function () {
    return gulp
        .src(fonts.in)
        .pipe(gulp.dest(fonts.out));
});

// Compile scss
gulp.task('sass', ['fonts'], function () {
    return gulp.src(scss.in)
        .pipe(sass(scss.sassOpts))
        .pipe(minifyCSS())
        .pipe(gulp.dest(scss.out));
});

// Compile js
gulp.task('js', function(){
    return gulp.src(source+'js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write())
        .pipe(minify())
        .pipe(gulp.dest(dest+'js'))
    });

// Build task
gulp.task('build', ['sass', 'js']);

// Development task
gulp.task('dev', ['sass' , 'js'], function () {
    gulp.watch(source+'sass/**/*', ['sass']);
    gulp.watch(source+'js/main.js', ['js']);
});
