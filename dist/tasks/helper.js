import gulp from 'gulp';
import plumber from 'gulp-plumber';
import size from 'gulp-size';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';
import vinylPaths from 'vinyl-paths';
import { deleteAsync } from 'del';
import Debug from "debug";
import themeKit from '@shopify/themekit';
import { appendFileSync } from 'fs';
import { slateConfig, commonConfig } from "./config.js";
import { logger } from '../utils.js';
const debug = Debug('1');
const {
  src,
  dest
} = gulp;
const watch = chokidar.watch;
const deleteFiles = files => {
  return gulp.src(files).pipe(plumber(logger.plumberErrorHandle)).pipe(vinylPaths(deleteAsync)).pipe(size({
    showFiles: true
  }));
};

/**
 * Factory for creating an event cache - used with a short debounce to batch any
 * file changes that occur in rapid succession during watch tasks.
 *
 */
class eventCache {
  constructor() {
    this.changeEvents = ['add', 'change'];
    this.unlinkEvents = ['unlink'];
    this.change = [];
    this.unlink = [];
    this.active = false;
  }

  /**
   * Pushes events to upload & remove caches for later batch deployment
   *
   * @param {String} event - chokidar event type - only cares about `(add|change|unlink)`
   * @param {String} path - relative path to file passed via event
   * @returns
   */
  addEvent(event, path) {
    if (this.changeEvents.indexOf(event) !== -1) {
      if (slateConfig.ignoreFiles.indexOf(path) === -1) this.change.push(path);
      return;
    }
    if (this.unlinkEvents.indexOf(event) !== -1) {
      if (slateConfig.ignoreFiles.indexOf(path) === -1) this.unlink.push(path);
    }
  }

  /**
   * Debounced (320ms) delegator function passing an {@link eventCache} object
   * through to a pair of custom functions for processing batch add/change or unlink events.
   * Clears the appropriate cache array after a change/delete function has been
   * called.
   *
   * @param {Function} changeFn - a custom function to process the set of files that have changed
   * @param {Function} delFn - a custom function to remove the set of files that have changed from the `dist` directory
   */
  processEvent(changeFn, delFn) {
    debounce((changeFn, delFn) => {
      if (this.change.length > 0) {
        changeFn(this.change);
        this.change = [];
      }
      if (this.unlink.length > 0) {
        delFn(this.unlink);
        this.unlink = [];
      }
    }, 320)(changeFn, delFn);
  }

  // for deploy.js only
  checkDeployStatus() {
    if (this.active) return;
    if (this.change.length) {
      this.active = true;
      this.deployFiles('deploy', this.change).then(() => {
        this.change = [];
        this.checkDeployStatus();
      });
    } else if (this.unlink.length) {
      this.active = true;
      this.deployFiles('remove', this.unlink).then(() => {
        this.unlink = [];
        this.checkDeployStatus();
      });
    }
  }

  // for deploy.js only
  deployFiles(cmd, files) {
    logger.logChildProcess(cmd);
    return new Promise((resolve, reject) => {
      debug(`theme-kit cwd to ${commonConfig.dist.root}`);
      // ignoreFiles,
      themeKit.command(cmd, {
        env: slateConfig.env,
        files,
        ignoredFiles: slateConfig.ignoreFiles,
        'allow-live': true,
        themeid: slateConfig.theme_id
      }, {
        cwd: commonConfig.dist.root
      }).then(() => {
        appendFileSync(slateConfig.deployLog, logger.logDeploysSuccess(cmd, files));
        this.active = false;
        resolve();
      }).catch(err => {
        appendFileSync(slateConfig.deployLog, logger.logDeployErrors(cmd, files, err));
        this.active = false;
        reject(err);
      });
    });
  }

  // for deploy.js only
  debounceDeploy() {
    debounce(this.checkDeployStatus, 320).bind(this)();
  }

  // for deploy command
  deployDistFolder() {
    return themeKit.command('deploy', {
      env: slateConfig.env,
      ignoredFiles: slateConfig.ignoreFiles,
      'allow-live': true,
      themeid: slateConfig.theme_id
    }, {
      cwd: commonConfig.dist.root
    });
  }
}

// Init an instance
const eventInstance = new eventCache();
export { eventInstance, eventCache, deleteFiles, src, dest, watch };