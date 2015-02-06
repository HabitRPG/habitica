/*global module:false*/
var _ = require('lodash');
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    git_changelog: {
        minimal: {
            options: {
                repo_url: 'https://github.com/habitrpg/habitrpg',
                appName : 'HabitRPG',
                branch_name: 'develop'
            }
        },
        extended: {
            options: {
                file: 'EXTENDEDCHANGELOG.md',
                repo_url: 'https://github.com/habitrpg/habitrpg',
                appName : 'HabitRPG',
                branch_name: 'develop',
                grep_commits: '^perf|^style|^fix|^feat|^docs|^refactor|^chore|BREAKING'
            }
        }
    },

    // UPDATE IT WHEN YOU ADD SOME FILES NOT ALREADY MATCHED!
    hashres: {
      build: {
        options: {
          fileNameFormat: '${name}-${hash}.${ext}'
        },
        src: [
          'website/build/*.js', 'website/build/*.css', 'website/build/favicon.ico',
          'website/build/common/dist/sprites/*.png',
          'website/build/common/img/sprites/backer-only/*.gif',
          'website/build/common/img/sprites/npc_ian.gif',
          'website/build/bower_components/bootstrap/dist/fonts/*'
        ],
        dest: 'build/*.css'
      }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('git-changelog');

};
