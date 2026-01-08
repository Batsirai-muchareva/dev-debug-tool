module.exports = function (grunt) {

    // Project configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            zip: ['zip-builds']
        },

        compress: {
            main: {
                options: {
                    archive: 'zip-builds/app-build-<%= grunt.template.today("yyyy-mm-dd_HHMMss") %>.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: '.',
                        src: [
                            '**/*',
                            '!node_modules/**',
                            '!zip-builds/**'
                        ],
                        dest: '/'
                    }
                ]
            }
        },
        // // Clean dist folder
        // clean: {
        //     build: ['dist']
        // },

        // Copy static files (HTML, images, etc.)
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**', '!css/**', '!js/**'],
                        dest: 'dist'
                    }
                ]
            }
        },

        // Minify JS
        uglify: {
            build: {
                files: {
                    'dist/js/app.min.js': ['src/js/**/*.js']
                }
            }
        },

        // Minify CSS
        cssmin: {
            build: {
                files: {
                    'dist/css/styles.min.css': ['src/css/**/*.css']
                }
            }
        },

        // Watch files for changes (optional)
        watch: {
            scripts: {
                files: ['src/**/*'],
                tasks: ['build'],
                options: {
                    spawn: false
                }
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('zip', [
        'clean:zip',
        'compress'
    ]);

    grunt.registerTask('default', ['zip']);

    // Build task
    // grunt.registerTask('build', [
    //     'clean',
    //     'copy',
    //     'uglify',
    //     'cssmin'
    // ]);

    // Default task
    // grunt.registerTask('default', ['build']);
};
