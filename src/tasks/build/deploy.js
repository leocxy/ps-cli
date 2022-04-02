import themekit from '@shopify/themekit'
import { EventCache, watch } from "../helper.js"
import { slateConfig, commonConfig } from '../config.js'
import { logger } from "../../utils.js"

const deployInstance = new EventCache()

export default {
    'watch:dist': () => {
        watch(['./', '!config.yml'], {
            cwd: commonConfig.dist.root,
            ignored: /(^|[/\\])\../,
            ignoreInitial: true,
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            deployInstance.addEvent(event, path)
            logger.deployTo(slateConfig.env)
            // deployInstance
        })
    }
}
