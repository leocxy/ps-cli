import plumber from 'gulp-plumber'
import size from 'gulp-size'
import { EventInstance, deletFiles, watch, src, dest } from "../helper.js"
import { slateConfig,commonConfig } from '../config.js'
import { logger } from "../../utils.js"

const assetPaths = [
    slateConfig.src.assets,
    slateConfig.src.templates,
    slateConfig.src.sections,
    slateConfig.src.snippets,
    slateConfig.src.locales,
    slateConfig.src.config,
    slateConfig.src.layout
]

/**
 * Copies assets to the `/dist` directory
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
 const processAssets = (files) => {
    logger.processFiles('build:assets')

    // @todo overwrite the process
    return src(files, { base: slateConfig.src.root })
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(size({showFiles: true}))
        .pipe(dest(commonConfig.dist.root))
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
    // @todo overwrite the process
    files = files.map((file) => file.replace(slateConfig.src.root, slateConfig.dist.root))
    return deletFiles(files)
}

export default {
    /**
     * Copies assets to the `/dist` directory
     *
     * @function build:assets
     * @memberof slate-cli.tasks.build
     * @static
     */
    'build:assets':() => {
        logger.processFiles('build:assets')
        return processAssets(assetPaths)
    },
    /**
     * Watches assets in the `/src` directory
     *
     * @function watch:assets
     * @memberof slate-cli.tasks.watch
     * @static
     */
    'watch:assets': () => {
        watch(assetPaths, {
            ignored: /(^|[/\\])\../,
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            EventInstance.addEvent(event, path)
            EventInstance.processEvent(processAssets, removeAssets)
        })
    }
}