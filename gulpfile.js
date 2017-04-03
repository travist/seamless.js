var gulp = require('gulp');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var childFiles = [
  'src/seamless.base.js',
  'src/seamless.connection.js',
  'src/seamless.child.js'
];

var parentFiles = [
  'src/seamless.base.js',
  'src/seamless.connection.js',
  'src/seamless.parent.js'
];

gulp.task('lint', function () {
  return gulp.src([
    'src/seamless.base.js',
    'src/seamless.child.js',
    'src/seamless.connection.js',
    'src/seamless.parent.js'
  ])
    .pipe(eslint({
      rules: {
        'strict': 2
      },
      envs: [
        'browser'
      ]
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('scripts-child', function() {
  return gulp.src(['lib/postmessage/postmessage.js'].concat(childFiles))
    .pipe(concat('seamless.child.js'))
    .pipe(gulp.dest('build/'))
    .pipe(rename('seamless.child.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('scripts-child-nopm', function() {
  return gulp.src(childFiles)
    .pipe(concat('seamless.child.nopm.js'))
    .pipe(gulp.dest('build/'))
    .pipe(rename('seamless.child.nopm.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('scripts-parent', function() {
  return gulp.src([
    'lib/postmessage/postmessage.js',
    'node_modules/custom-event-polyfill/custom-event-polyfill.js'
  ].concat(parentFiles))
    .pipe(concat('seamless.parent.js'))
    .pipe(gulp.dest('build/'))
    .pipe(rename('seamless.parent.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('scripts-parent-nopm', function() {
  return gulp.src(parentFiles)
    .pipe(concat('seamless.parent.nopm.js'))
    .pipe(gulp.dest('build/'))
    .pipe(rename('seamless.parent.nopm.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('scripts', ['scripts-child', 'scripts-child-nopm', 'scripts-parent', 'scripts-parent-nopm']);
gulp.task('build', ['lint', 'scripts']);
gulp.task('default', ['build']);
