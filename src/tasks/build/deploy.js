import { eventCache, watch } from "../helper.js"
import { commonConfig } from '../config.js'
import { logger } from "../../utils.js"

const cache = new eventCache()

export default {
    'watch:dist': () => {
        watch(['.'], {
            cwd: commonConfig.dist.root,
            ignored: [/(^|[/\\])\../, 'config.yml'],
            ignoreInitial: true,
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            cache.addEvent(event, path)
            cache.debounceDeploy()
        })
    },
    'deploy:dist': () => {
        return cache.deployDistFolder()
    }
}
