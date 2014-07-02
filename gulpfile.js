/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var spawn = require('child_process').spawn;
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;

var less = require('gulp-less');
var uglify = require('gulp-uglify');

var node;

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src('predist/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'))
        .pipe(gulp.dest('public/js'))
        .pipe(reload({stream: true, once: true}));
});

// Optimize Images
gulp.task('images', function () {
    return gulp.src('predist/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('public/images'))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'images'}));
});

// Automatically Prefix CSS
gulp.task('styles:css', function () {
    return gulp.src('predist/styles/**/*.css')
        //.pipe(uglify())
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('public/css'))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'styles:css'}));
});

// Compile Sass For Style Guide Components (predist/styles/components)
gulp.task('styles:components', function () {
    return gulp.src('predist/styles/components/components.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['predist/styles/components']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles/components'))
        .pipe($.size({title: 'styles:components'}));
});

// Compile Any Other Sass Files You Added (predist/styles)
gulp.task('styles:scss', function () {
    return gulp.src(['predist/styles/**/*.scss', '!predist/styles/components/components.scss'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['predist/styles']
        }))
        .pipe(uglify())
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size({title: 'styles:scss'}));
});

gulp.task('styles:less', function () {

    return gulp.src('predist/styles/main.less')

        .pipe(less())
        //.pipe(uglify())
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('public/css'))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'styles:less'}));
});

// Output Final CSS Styles
gulp.task('styles', ['styles:components', 'styles:scss', 'styles:less', 'styles:css']);

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
    return gulp.src('predist/**/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,predist}'}))
        // Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify()))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.csso()))
        // Remove Any Unused CSS
        // Note: If not using the Style Guide, you can delete it from
        // the next line to only include styles your project uses.
        .pipe($.if('*.css', $.uncss({ html: ['predist/index.html', 'predist/styleguide/index.html'] })))
        .pipe($.useref.restore())
        .pipe($.useref())
        // Update Production Style Guide Paths
        .pipe($.replace('components/components.css', 'components/main.min.css'))
        // Minify Any HTML
        .pipe($.minifyHtml())
        // Output Files
        .pipe(gulp.dest('public'))
        .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', function (cb) {
    rimraf('public', rimraf.bind({}, '.tmp', cb));
});

var start = function () {
    node = spawn('node', ['index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code == 8) gulp.log('Error detected');
    })
};

var restart = function () {
    node.kill();
    start();
};

// Watch Files For Changes & Reload
gulp.task('serve', function () {


    var bs = browserSync.init(null, {});

    bs.events.on('init', function (api) {
        var snippet = api.options.snippet;
        process.env.snippet = snippet || false;
        start();
    });

    gulp.watch(['controllers/*.js', 'models/*.js'], restart);
    gulp.watch(['public/templates/**/*.dust', 'public/templates/*.dust'], reload);

    gulp.watch(['predist/**/*.html'], reload);
    gulp.watch(['predist/styles/**/*.{css,scss,less}'], ['styles']);
    gulp.watch(['.tmp/styles/**/*.css'], reload);
    gulp.watch(['predist/scripts/**/*.js'], ['jshint']);
    gulp.watch(['predist/images/**/*'], ['images']);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
    runSequence('styles', ['jshint', 'html', 'images'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
    // By default, we use the PageSpeed Insights
    // free (no API key) tier. You can use a Google
    // Developer API key if you have one. See
    // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
    url: 'https://example.com',
    strategy: 'mobile'
}));

process.on('exit', function () {
    if (node) node.kill();
});
