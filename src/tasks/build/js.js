import plumber from 'gulp-plumber'
import include from 'gulp-include'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import sourceMap from 'gulp-sourcemaps'
import pm from 'picomatch'
import { eventInstance, deleteFiles, watch, src, dest } from "../helper.js"
import { slateConfig, commonConfig } from '../config.js'
import { logger } from "../../utils.js"

const isMatch = pm(slateConfig.src.js)

// Overwrite processThemeJs or processVendorJs


/**
 * Process the theme JS and copy to `/dist/assets` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
const processThemeJs = () => {
    // Check Overwrite function
    let fn = slateConfig.fn?.processThemeJs || null
    if (typeof(fn) === 'function') {
        return fn({...slateConfig, ...commonConfig}, logger)
    }
    logger.processFiles('build:js')
    return src([slateConfig.roots.js, `!${slateConfig.roots.vendorJs}`])
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(sourceMap.init({}))
        .pipe(babel({plugins: slateConfig.plugins.babel}))
        .pipe(include())
        .pipe(uglify(slateConfig.plugins.uglify.theme))
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
    // Check Overwrite function
    if (slateConfig.fn?.processVendorJs !== undefined && typeof(slateConfig.fn.processVendorJs) === 'function') {
        return slateConfig.fn.processVendorJs({...slateConfig, ...commonConfig}, logger)
    }
    logger.processFiles('build:vendor-js')
    return src(slateConfig.roots.vendorJs)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(include())
        .pipe(uglify(slateConfig.plugins.uglify.vendor))
        .pipe(dest(commonConfig.dist.assets))
}

const removeJs = (files) => {
    logger.processFiles('remove:js')
    files = files.map(file => file.replace('src/scripts', 'dist/assets'))
    // check files ?
    return deleteFiles(files)
}

export default {
    'build:js': () => {
        return processThemeJs()
    },
    'watch:js': () => {
        watch([slateConfig.roots.js, `!${slateConfig.roots.vendorJs}`, `!${slateConfig.src.vendorJs}`], {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            if (event === 'unlink' && isMatch(path)) {
                eventInstance.addEvent(event, path)
                eventInstance.processEvent(() => {}, removeJs)
            }
            processThemeJs()
        })
    },
    'build:vendor-js': () => {
        return processVendorJs()
    },
    'watch:vendor-js': () => {
        watch([slateConfig.roots.vendorJs, slateConfig.src.vendorJs], {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            processVendorJs()
            // @todo delete file
        })
    }
}
