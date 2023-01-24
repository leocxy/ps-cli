import plumber from 'gulp-plumber'
import cssImport from 'gulp-cssimport'
import extReplace from 'gulp-ext-replace'
import { watch, src, dest } from "../helper.js"
import { slateConfig, commonConfig } from '../config.js'
import { logger } from "../../utils.js"

/**
 * Concatenate css via gulp-cssimport and copys to the `/dist` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processCss = () => {
    logger.processFiles('build:css')

    // @todo overwrite the process
    return src(slateConfig.src.css)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(cssImport())
        .pipe(extReplace('.css.liquid', '.css'))
        .pipe(extReplace('.scss.liquid', '.scss'))
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
            // @todo remove the css?
            logger.fileEvent(event, path)
            processCss()
        })

    }
}
