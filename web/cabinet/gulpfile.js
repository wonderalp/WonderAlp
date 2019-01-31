var argv   = require('yargs').argv,
    gulp   = require('gulp'),
    sass   = require('gulp-ruby-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del    = require('del'),
    opts   = argv.prod
        ? {
            sass:   {style: 'compressed'},
            uglify: {}
        }
        : {
            sass:   {},
            uglify: {mangle: false, compress: false, output: {beautify: true}}
        };


gulp.task('css', function() {
  return sass('src/css/main.scss', opts.sass)
    .pipe(gulp.dest('www/a'));
});


gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(uglify(opts.uglify).on('error', function(e) {
        console.log(String(e))
        this.end();
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('www/a'));
});


gulp.task('watch', function() {
    gulp.watch('src/css/*.scss',  ['css']);
    gulp.watch('src/js/*.js',     ['js']);
});


gulp.task('clean', function() {
    del(['www/a/main.css', 'www/a/main.js'])
});


gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js');
});
