import plumber from 'gulp-plumber'
import include from 'gulp-include'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import sourceMap from 'gulp-sourcemaps'
import { watch, src, dest } from "../helper.js"
import { slateConfig, commonConfig } from '../config.js'
import { logger } from "../../utils.js"

/**
 * Process the theme JS and copys to `/dist/assets` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processThemeJs = () => {
    logger.processFiles('build:js')

    // @todo overwrite the process
    return src([slateConfig.roots.js, `!${slateConfig.roots.vendorJs}`])
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(sourceMap.init({}))
        .pipe(babel({plugins: slateConfig.plugins.babel}))
        .pipe(uglify(slateConfig.plugins.uglify.theme))
        .pipe(include())
        .pipe(sourceMap.write())
        .pipe(dest(commonConfig.dist.assets))
}

/**
 * Process the vendor JS and copys to `/dist/assets` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processVendorJs = () => {
    logger.processFiles('build:vendor-js')

    // @todo overwrite the process
    return src(slateConfig.roots.vendorJs)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(include())
        .pipe(uglify(slateConfig.plugins.uglify.vendor))
        .pipe(dest(commonConfig.dist.assets))
}

export default {
    'build:js': () => {
        processThemeJs()
    },
    'watch:js': () => {
        watch([slateConfig.roots.js, `!${slateConfig.roots.vendorJs}`, `!${slateConfig.src.vendorJs}`], {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            processThemeJs()
        })
    },
    'build:vendor-js': () => {
        processVendorJs()
    },
    'watch:vendor-js': () => {
        watch([slateConfig.roots.vendorJs, slateConfig.src.vendorJs], {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            processVendorJs()
        })
    }
}
