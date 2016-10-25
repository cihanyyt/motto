var $ = require('gulp-load-plugins')();
var tinylr;

var gulp = require('gulp'),
  clean = require('gulp-clean'),
  jshint = require('gulp-jshint'),
  Server = require('karma').Server,
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  gp_rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  concatCss = require('gulp-concat-css'),
  uglifycss = require('gulp-uglifycss'),
  sass = require('gulp-sass'),
  connectlivereload = require('connect-livereload'),
  express = require('express'),
  path = require('path'),
  watch = require('gulp-watch');

gulp.task('express', function() {
  var app = express();
  app.use(connectlivereload({ port: 35729 }));
  app.use(express.static('./'));
  var port = 4000;
  app.listen(port, '0.0.0.0', function(){
    console.log('App running and listening on port', port);
  });
});

function notifyLiveReload(event) {
  tinylr.changed({ body: { files: [path.relative(__dirname, event.path)]}});
  var filepath = path.relative(__dirname, event.path);
  console.log(filepath + " changed");
  // if(filepath.indexOf("dist") !== -1){
  //   return;
  // }
  // var prefix = filepath.substring(destpath.lastIndexOf('.'));
  // if(prefix.indexOf(".js" !== -1)){
  //   minifyJS();
  // }
  // var destpath = 'dist\\' + filepath;
  // console.log(destpath);
  // var basepath = destpath.substring(0, destpath.lastIndexOf('\\'));
  // var srcbasepath = filepath.substring(0, destpath.lastIndexOf('\\'));
  // var baseprefix = destpath.substring(destpath.lastIndexOf('.'));
  // console.log(destpath + ' will be copied basepath: ' + basepath + ' baseprefix: ' + baseprefix);
  // console.log(basepath + '\\*' + baseprefix);
  // gulp.src(srcbasepath + '\\*.html', {base: basepath}).
  // pipe(gulp.dest(basepath));
}

gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
  tinylr.listen(35729);
});

var bundleVendorCSS = function () {
  gulp.src(['node_modules/font-awesome/css/font-awesome.min.css',
    'stylesheets/vendor/*.css'])
    .pipe(concatCss('vendor.css'))
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(uglifycss())
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./dist/css'));
};

var processSass = function() {
  gulp.src(['stylesheets/main.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gp_rename('main.css'))
    .pipe(uglifycss())
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./dist/css'));
};


var bundleVendorJS = function() {
  gulp.src(['node_modules/angular/angular.min.js',
    'js/vendor/firebase.js',
    'node_modules/angularfire/dist/angularfire.min.js',
    'node_modules/angular-*/**/angular-*.min.js',
    '!node_modules/**/angular-mocks.js',
    'js/vendor/*.js',
    'node_modules/ng-dialog/**/ngDialog*.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));

};

var minifyJS = function () {

  gulp.src(['js/*.js',
    'js/**/*.js',
    '!js/vendor/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./'))
    .pipe(gulp.dest('./dist/'));
};

gulp.task('clean-dist', function () {
  return gulp.src('dist/*', {read: false})
    .pipe(clean());
});

gulp.task('bundle', function() {
  bundleVendorCSS();
  bundleVendorJS();
  processSass();
  minifyJS();
});

gulp.task('watch', function (cb) {
  watch('**/*.html', notifyLiveReload);
  watch('**/*.scss', processSass);
  watch('**/*.scss', notifyLiveReload);
  watch('./*.js', notifyLiveReload);
  watch('js/**/*.js', minifyJS);
});

gulp.task('lint', function() {
  return gulp.src(['!js/vendor/**/*.js','js/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch-test', function (done) {
  return new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, done).start();
});

gulp.task('test-once', function (done) {
  Server.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    reporters: ['mocha']
  }, function(error) {
    done(error);
  });
});

gulp.task('copy', function(){
  gulp.src('node_modules/roboto-fontface/fonts/*{Regular,Bold}.*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(gulp.dest('fonts'));
  gulp.src('node_modules/font-awesome/fonts/*.{woff,woff2,eot,svg,ttf}')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(gulp.dest('fonts'));
  gulp.src('components/*')
    .pipe(gulp.dest('dist/components'));
  gulp.src('img/*')
    .pipe(gulp.dest('dist/img'));
  gulp.src('favicon.ico')
    .pipe(gulp.dest('dist'));
  gulp.src('README.md')
    .pipe(gulp.dest('dist'));
  gulp.src('CNAME')
    .pipe(gulp.dest('dist'));
  gulp.src('index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['bundle', 'copy', 'express', 'livereload', 'watch']);
gulp.task('test', ['lint', 'watch-test']);
gulp.task('testci', ['lint', 'test-once']);
gulp.task('build', ['clean-dist', 'bundle', 'copy']);
