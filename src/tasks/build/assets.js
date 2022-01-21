import { EventCache, processAssets, removeAssets, watch } from "../helper.js"
import { slateConfig } from '../config.js'
import { logger } from "../../utils.js"
import vinylPaths from "vinyl-paths"

const assetPaths = [
    slateConfig.src.assets,
    slateConfig.src.templates,
    slateConfig.src.sections,
    slateConfig.src.snippets,
    slateConfig.src.locales,
    slateConfig.src.config,
    slateConfig.src.layout
]

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
    'watch:assets': (cb) => {
        var events = new EventCache()

        watch(assetPaths, {
            ignored: /(^|[/\\])\../,
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            events.addEvent(event, path)
            events.processEvent(processAssets, removeAssets)
        })

        return cb()
    }
}
