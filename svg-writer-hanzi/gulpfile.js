/* eslint-disable */
const gulp = require('gulp');
const svgo = require('gulp-svgo');
const tinypng = require('gulp-tinypng-compress');
// const tinyNokey = require('gulp-tinypng-nokey'); // 不需要key。但是太慢了

const compressDir =[
    'src',
    'static'
]

gulp.task('compress-image', done => {
    // no-key版
    // gulp.src(`{${compressDir}}/**/*.{png,jpg,jpeg}`).pipe(tinyNokey()).pipe(gulp.dest('./'));

    // 压缩位图
    gulp.src(`{${compressDir}}/**/*.{png,jpg,jpeg}`)
        .pipe(tinypng({
            key: '1zw5FWkzXKmRmydV9PwxY6TJlVLG4NrW', // 一天只能转500个，查询剩余次数 https://tinypng.com/dashboard/api#token/mpsbHkHn6PkS1ygpc8c0YfNtn0rhq4g0/z1H17wEEZxt2_5BK_Kb4
            summarize: true,
            parallelMax: 10,
            sameDest: true,
            log: true,
            sigFile: '.tinypng-sigs'
        }))
        .pipe(gulp.dest('./'));

    // 压缩svg
    gulp.src(`{${compressDir}}/**/*.svg`)
        .pipe(svgo())
        .pipe(gulp.dest('./'));

    done();
});