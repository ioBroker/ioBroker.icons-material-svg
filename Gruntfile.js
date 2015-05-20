// To use this file in WebStorm, right click on the file name in the Project Panel (normally left) and select "Open Grunt Console"

/** @namespace __dirname */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

module.exports = function (grunt) {
    var httpSrcPath = 'https://github.com/google/material-design-icons/tarball/master';
    var prefix      = "https://raw.githubusercontent.com/google/material-design-icons/master/";
    var imgSrcPath  = 'google-material-design-icons-*/*/svg/production/*.svg';

    // Project configuration.
    grunt.initConfig({
        clean: {
            all: ['www/*.svg', 'www/*.png', 'www/*.jpg', '.build']
        },
        copy: {
            icons: {
                files: [
                    {
                        expand: true,
                        cwd: __dirname + '/.build/icons/',
                        src: [imgSrcPath],
                        dest: __dirname + '/www',
                        rename: function (dest, src) {
                            var parts = src.replace(/\\/g, '/').split('/');
                            return __dirname + '/www/' + parts[parts.length - 4] + '/' + parts[parts.length - 1];
                        }
                    }
                ]
            }
        },
        curl: {
            '.build/icons.tar.gz': httpSrcPath
        },
        targz: {
            icons: {
                files: {
                    ".build/icons":  ".build/icons.tar.gz"
                }
            }
        }
    });

    grunt.registerTask('removeCopies', function () {
        var fs = require('fs');
        var dir = fs.readdirSync(__dirname + '/www');
        for (var i = 0; i < dir.length; i++) {
            if (dir[i] == 'index.html') continue;
            var subdir = fs.readdirSync(__dirname + '/www/' + dir[i]);
            for (var j = 0; j < subdir.length; j++) {
                // ic_add_24px.svg
                // ic_add_48px.svg
                if (subdir[j].indexOf('24px.') != -1) {
                    if (fs.existsSync(__dirname + '/www/' + dir[i] + '/' + subdir[j].replace('24px.', '48px.'))) {
                        fs.unlinkSync(__dirname + '/www/' + dir[i] + '/' + subdir[j]);
                    }
                } else if (subdir[j].indexOf('18px.') != -1) {
                    if (fs.existsSync(__dirname + '/www/' + dir[i] + '/' + subdir[j].replace('18px.', '48px.'))) {
                        fs.unlinkSync(__dirname + '/www/' + dir[i] + '/' + subdir[j]);
                    }
                }else if (subdir[j].indexOf('36px.') != -1) {
                    if (fs.existsSync(__dirname + '/www/' + dir[i] + '/' + subdir[j].replace('36px.', '48px.'))) {
                        fs.unlinkSync(__dirname + '/www/' + dir[i] + '/' + subdir[j]);
                    }
                }
            }
        }
    });
    grunt.registerTask('updateList', function () {
        var fs = require('fs');
        var dir = fs.readdirSync(__dirname + '/www');
        var readme = '';
        var html = '<html><body style=""><table>';
        var inLine = 6;
        for (var i = 0; i < dir.length; i++) {
            if (dir[i] == 'index.html') continue;
            var subdir = fs.readdirSync(__dirname + '/www/' + dir[i]);
            var htmlLineImg  = '<tr>';
            var htmlLineName = '<tr>';
            html   += '<tr style="height:15px;background:lightblue"><td colspan="' + inLine + '" style="height:15px;font-size:24px;text-align:center">' + dir[i].substring(0, 1).toUpperCase() + dir[i].substring(1) + '</td></tr>';
            readme += '### ' + dir[i] + '\n===========================\n';

            var cur = 0;
            for (var j = 0; j < subdir.length; j++) {
                if (cur && !(cur % inLine)) {
                    html += htmlLineImg  + '</tr>';
                    html += htmlLineName + '</tr>';
                    htmlLineImg  = '<tr>';
                    htmlLineName = '<tr>';
                    cur = 0;
                }
                //readme += '![' + dir[i] + '](www/' + dir[i] + ')\n';
                readme += '![' + subdir[j] + '](' + prefix + dir[i] + '/' + subdir[j] + ')\n';

                htmlLineImg  += '<td style="text-align: center"><img src="' + dir[i] + '/' + subdir[j] + '" width="64" height="64"></td>\n';
                if (subdir[j].length > 30) {
                    htmlLineName += '<td style="text-align: center" title="' + subdir[j] + '">' + subdir[j].substring(0, 30) + '...</td>\n';
                } else {
                    htmlLineName += '<td style="text-align: center">' + subdir[j] + '</td>\n';
                }
                cur++;
            }
            html += htmlLineImg + '</tr>';
            html += htmlLineName + '</tr>';
        }
        html += '</table></body></html>';
        grunt.file.write('ICONLIST.md', readme);
        grunt.file.write('www/index.html', html);
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-tar.gz');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-curl');

    grunt.registerTask('default', [
        'curl',
        'targz',
        'copy',
        'removeCopies',
        'updateList'
    ]);
};