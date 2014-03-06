var gulp = require('gulp');
var gutil = require('gulp-util');
var gtypescript = require('gulp-tsc');
var gjade = require('gulp-jade');

gulp.task('default', function(){
    gulp.src(['index.ts'])
        .pipe(gtypescript())
        .pipe(gulp.dest("."));
    gulp.src(['index.jade'])
        .pipe(gjade({pretty: true}))
        .pipe(gulp.dest("."));
});
