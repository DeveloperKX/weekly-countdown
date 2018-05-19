var gulp = require('gulp');
var fs = require('fs');
var cheerio = require('cheerio');

gulp.task('ionic:build:before', function(){
    persistVersion();
})

gulp.task('ionic:watch:before', function(){
    persistVersion();
})

function persistVersion(){
    var config = fs.readFileSync('./config.xml');
    var $ = cheerio.load(config, { xmlMode: true });
    var version = $('widget')[0].attribs.version;
    var file = fs.createWriteStream('./src/version.ts');
    file.write(`export const Version = '${version}';`);

    console.log(`Version updated: ${version}`);
};