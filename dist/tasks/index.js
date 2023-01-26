/**
 * all task going to register here
 */
import Gulp from 'gulp';
import config_jobs from './build/config.js';
import assets_jobs from './build/assets.js';
import svg_jobs from './build/svg.js';
import css_jobs from './build/css.js';
import js_jobs from './build/js.js';
import deploy_jobs from './build/deploy.js';
import util_jobs from './build/utils.js';
import browser_jobs from './build/browser.js';
const {
  task,
  series,
  parallel
} = Gulp;

// Watch files and deploy
task('watch', series(config_jobs['validate:id'], config_jobs['build:config'], config_jobs["overwrite:build_process"],
// observers
parallel(assets_jobs['watch:assets'], config_jobs['watch:config'], svg_jobs['watch:svg'], css_jobs['watch:css'], js_jobs['watch:js'], js_jobs['watch:vendor-js'], deploy_jobs['watch:dist'], browser_jobs['sync-reload'])));

// build files
task('build', series(util_jobs['clean'], config_jobs["overwrite:build_process"], assets_jobs['build:assets'], svg_jobs['build:svg'], js_jobs['build:js']));

// build & deploy
task('deploy', series(config_jobs['validate:id'], util_jobs['clean'], config_jobs['build:config'], config_jobs["overwrite:build_process"], assets_jobs['build:assets'], svg_jobs['build:svg'], js_jobs['build:js'], deploy_jobs['deploy:dist']));

// list all the themes
task('theme-list', util_jobs['theme-list']);