import { readFileSync } from 'fs'
import gulp from 'gulp'
import plumber from 'gulp-plumber'
import size from 'gulp-size'
import svgmin from 'gulp-svgmin'
import extReplace from 'gulp-ext-replace'
import { load } from 'js-yaml'
import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import chokidar from 'chokidar'
import debounce from 'lodash.debounce'
import vinylPaths from 'vinyl-paths'
import del from 'del'
import { commonConfig, slateConfig } from './config.js'
import { logger } from '../utils.js'
const argv = yargs(hideBin(process.argv)).argv
const { watch } = gulp


const deletFiles = (files) => {
    return gulp.src(files)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(vinylPaths(del))
        .pipe(size({showFiles: true}))
}

/**
 * Copies assets to the `/dist` directory
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processAssets = (files) => {
    logger.processFiles('build:assets')
    return gulp.src(files, { base: slateConfig.src.root })
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(size({showFiles: true}))
        .pipe(gulp.dest(commonConfig.dist.root))
}

/**
 * Deletes specified files
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const removeAssets = (files) => {
    logger.processFiles('remove:assets')
    files = files.map((file) => file.replace(slateConfig.src.root, slateConfig.dist.root))
    return deletFiles(files)
}

/**
 * Processing for SVGs prior to deployment - adds accessibility markup, and converts
 * the file to a liquid snippet.
 *
 * @param {String|Array} files - glob/array of files to match & send to the stream
 * @returns {Stream}
 * @private
 */
const processIcons = (files) => {
    logger.processFiles('build:svg')
    return gulp.src(files)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(svgmin(slateConfig.plugins.svgmin))
        .pipe(extReplace('.liquid'))
        .pipe(size({showFiles: true, pretty: true}))
        .pipe(gulp.dest(commonConfig.dist.snippets))
}

/**
 * Cleanup/remove liquid snippets from the `dist` directory during watch tasks if
 * any underlying SVG files in the `src` folder have been removed.
 *
 * @param {Array} files - glob/array of files to match & send to the stream
 * @returns {Stream}
 * @private
 */
const removeIcons = (files) => {
    logger.processFiles('remove:svg')
    files = files.map(file => file.replace('src/icons', 'dist/snippets').replace('.svg', '.liquid'))
    return deletFiles(files)
}

/**
 * Factory for creating an event cache - used with a short debounce to batch any
 * file changes that occur in rapid succession during watch tasks.
 *
 */
class EventCache {
    constructor() {
        this.changeEvents = ['add', 'change']
        this.unlinkEvents = ['unlink']
        this.change = []
        this.unlink = []
    }

    /**
     * Pushes events to upload & remove caches for later batch deployment
     *
     * @param {String} event - chokidar event type - only cares about `(add|change|unlink)`
     * @param {String} path - relative path to file passed via event
     * @returns
     */
    addEvent (event, path) {
        if (this.changeEvents.indexOf(event) !== -1) {
            return this.change.indexOf(path) === -1 ? this.change.push(path) : null
        }

        if (this.unlinkEvents.indexOf(event) !== -1) {
            return this.unlink.indexOf(path) === -1 ? this.unlink.push(path) : null
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
    processEvent (changeFn, delFn) {
        debounce((changeFn, delFn) => {
            if (this.change.length > 0) {
                changeFn(this.change)
                this.change = []
            }

            if (this.unlink.length > 0) {
                delFn(this.unlink)
                this.unlink = []
            }
        }, 320)(changeFn, delFn)
    }
}

export {
    EventCache,
    processAssets,
    removeAssets,
    processIcons,
    removeIcons,
    watch,
}

// gulp sub tasks
export default {

    /**
     * Watches for changes in the `./dist` folder and passes event data to the
     * `cache` via {@link pushToCache}. A debounced {@link deployStatus} is also
     * called to pass files updated to the remote server through {@link deploy}
     * when any active deploy completes.
     *
     * @function watch:dist
     * @memberof slate-cli.tasks.watch
     * @static
     */
    'watch:dist': () => {
        const observer = chokidar.watch(['./', '!config.yml'], {
            cwd: commonConfig.dist.root,
            ignored: /(^|[/\\])\../,
            ignoreInitial: true
        })

        observer.on('all', (event, path) => {
            logger.fileEvent(event, path)
            // debounce @todo
        })
    },
}
