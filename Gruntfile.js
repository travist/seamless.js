module.exports = function(grunt) {

  var postmessageFiles = [
    'lib/postmessage/postmessage.js'
  ];

  var parentFiles = [
    'src/seamless.base.js',
    'src/seamless.connection.js',
    'src/seamless.parent.js'
  ];

  var childFiles = [
    'src/seamless.base.js',
    'src/seamless.connection.js',
    'src/seamless.child.js'
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js'].concat(parentFiles).concat(childFiles)
    },
    concat: {
      options: {
        separator: '',
      },
      build: {
        files: {
          'build/seamless.parent.nopm.js': parentFiles,
          'build/seamless.child.nopm.js': childFiles,
          'build/seamless.parent.js': postmessageFiles.concat(parentFiles),
          'build/seamless.child.js': postmessageFiles.concat(childFiles)
        }
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'build/seamless.parent.nopm.min.js': parentFiles,
          'build/seamless.child.nopm.min.js': childFiles,
          'build/seamless.parent.min.js': postmessageFiles.concat(parentFiles),
          'build/seamless.child.min.js': postmessageFiles.concat(childFiles)
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
