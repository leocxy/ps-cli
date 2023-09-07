import {deleteAsync} from "del"
import themeKit from "@shopify/themekit"
import {commonConfig, slateConfig} from "../config.js"


export default {
    'clean': () => {
        return deleteAsync(commonConfig.dist.root)
    },
    'list': () => {
        return themeKit.command(
            'get',
            {env: slateConfig.env, 'list': true}
        )
    },
    'download': () => {
        return themeKit.command(
            'download',
            {env: slateConfig.env, dir: slateConfig.dir}
        )
    }
}
