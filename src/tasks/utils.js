const { readFileSync } = require('fs')
const { load } = require('js-yaml')
const { commonConfig, slateConfig } = require('./config')
const { logger } = require('../utils')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const vinylPaths = require('vinyl-paths')
const del = require('del')
const argv = yargs(hideBin(process.argv)).argv


/**
 * Validate theme_id used for the environment
 * @param {Object} - settings of theme_id and environment
 * @returns {Promise}
 * @private
 */
 const validateId = (settings) => {
    return new Promise((resolve, reject) => {
        if (settings.theme_id === 'live') resolve()
        const id = Number(settings.theme_id)
        isNaN(id) ? reject(settings) : resolve()
    })
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
    return gulp.src(files)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(vinylPaths(del))
        .pipe(size({showFiles: true}))
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

module.exports = {
    /**
     * Validate the config.yml theme_id is an integer or "live"
     * @function validateConfig
     * @memberof watch
     * @private
     */
    'validate:id': () => {
        let file
        try {
            file = readFileSync(commonConfig.tkConfig, 'utf-8')
        } catch (err) {
            if (err.code != 'ENOENT') throw new Error(err)

            logger.configError()

            throw new Error('An Error Occurred')
        }

        const tkConfig = load(file)
        const promises = []

        Object.keys(tkConfig).forEach(env => {
            promises.push(validateId({theme_id: tkConfig[env].theme_id, env: env}))
        })

        return Promise.all(promises).catch(result => {
            logger.invalidThemeId(result.theme_id, result.env)
            throw new Error('Exit caused by the error')
        })
    },
    /**
     * ThemeKit requires the config file to be in the `root` directory for files it
     * will be uploading to our store.  As such we need to move this file to `./dist`
     * before running any deployment tasks.
     *
     * @function build:config
     * @memberof slate-cli.tasks.build
     * @static
     */
    'build:config': () => {
        logger.processFiles('build:config')

        return gulp.src(commonConfig.tkConfig)
            .pipe(plumber(logger.plumberErrorHandle))
            .pipe(size({showFiles: true}))
            .pipe(gulp.dest(commonConfig.dist.root))
    },
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
    /**
     * Watches assets in the `/src` directory
     *
     * @function watch:assets
     * @memberof slate-cli.tasks.watch
     * @static
     */
    'watch:assets': () => {
        var events = EventCache()
        // @todo
        // slate asset paths
        const assetPaths = [slateConfig.src.assets, slateConfig.src.templates, slateConfig.src.sections, slateConfig.src.snippets, slateConfig.src.locales, slateConfig.src.config, slateConfig.src.layout]
        chokidar.watch(assetPaths, {
            ignored: /(^|[/\\])\../,
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            events.addEvent(event, path)
            events.processEvent(processAssets, removeAssets)
        })
    }
}
