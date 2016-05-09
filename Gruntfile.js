module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: '\n',
        sourceMap:true
      },
      app: {
        // the files to concatenate
        src: ['src/modules/*.js','src/services/*.js','src/**/*.js'],
        // the location of the resulting JS file
        dest: 'public/dist/app.js'
      }
    },
    copy: {
        files: {
            cwd: 'src/partials',  // set working folder / root to copy
            src: '**/*.html',      // copy all files and subfolders **with ending .html**
            dest: 'public/partials',    // destination folder
            expand: true           // required when using cwd
        }
    },
    less:{
        dev:{
            options:{

            },
            files:{
                "public/dist/app.css": "src/**/*.less"
            }
        }
    },
    watch: {
      files: ['<%= concat.app.src %>','<%= less.dev.files["public/dist/app.css"] %>','src/partials/**/*.html'],
      tasks: ['concat','less','copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['concat','less','copy']);
  grunt.registerTask('stuff', ['watch']);

};
