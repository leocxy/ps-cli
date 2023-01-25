import {deleteAsync} from "del"
import {commonConfig} from "../config.js"

export default {
    'clean': () => {
        return deleteAsync(commonConfig.dist.root)
    }
}
