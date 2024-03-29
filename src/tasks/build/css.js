import plumber from 'gulp-plumber'
import cssImport from 'gulp-cssimport'
import extReplace from 'gulp-ext-replace'
import {watch, src, dest} from "../helper.js"
import {slateConfig, commonConfig} from '../config.js'
import {logger} from "../../utils.js"
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)


/**
 * Concatenate css via gulp-cssImport and copy to the `/dist` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processCss = () => {
    // Check Overwrite function
    let fn = slateConfig.fn?.processCss || null
    if (typeof(fn) === 'function') {
        return fn({...slateConfig, ...commonConfig}, logger)
    }
    /**
     * @note
     * sass() -> will change the file extension to .css
     * 1. x.scss -> x.css
     * 2. x.scss.liquid -> x.scss.css
     * Therefore, we need to replace the extension back to .css.liquid
     */
    logger.processFiles('build:css')
    return src(slateConfig.roots.css)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(cssImport())
        .pipe(sass().on('error', sass.logError))
        .pipe(extReplace('.css.liquid', '.scss.css'))
        .pipe(dest(commonConfig.dist.assets))
}

export default {
    /**
     * Concatenate css via gulp-cssimport
     *
     * @function build:css
     * @memberof slate-cli.tasks.build
     * @static
     */
    'build:css': () => {
        return processCss()
    },
    /**
     * Watches css in the `/src` directory
     *
     * @function watch:css
     * @memberof slate-cli.tasks.watch
     * @static
     */
    'watch:css': () => {
        watch(slateConfig.src.css, {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            processCss()
        })

    }
}
