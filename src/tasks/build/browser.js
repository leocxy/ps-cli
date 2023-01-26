import browserSync from 'browser-sync'
import Debug from 'debug'
import {join, dirname} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import {fileURLToPath} from "url"
import {slateConfig} from "../config.js"

const debug = Debug('1')
const browser = browserSync.create()
const __dirname = dirname(fileURLToPath(import.meta.url))


const initBrowser = () => {
    browser.active ? browser.exit() : writeFileSync(slateConfig.deployLog, '')
    const dev_script = readFileSync(join(dirname(__dirname), 'dev-script.js'))
    let target = `https://${slateConfig.store}?${(new URLSearchParams({preview_theme_id: slateConfig.theme_id})).toString()}`
    debug(`Proxy Target: ${target}`)
    /**
     * Shopify sites with redirection enabled for custom domains force redirection
     * to that domain. `?_fd=0` prevents that forwarding.
     */
    let param_str = '_fd=0'
    browser.init({
        proxy: {
            target,
            middleware: (req, res, next) => {
                let prefix = req.url.indexOf('?') === -1 ? '?' : '&'
                req.url += prefix + param_str
                next()
            }
        },
        snippetOptions: {
            // Provide a custom regex for inserting the snippet
            rule: {
                match: /<\/body>/i,
                fn: (snippet, match) => `<script defer="defer">${dev_script}</script>${snippet}${match}`
            }
        }
    })
}

export default {
    'sync-init': () => {
        initBrowser()
    },
    'sync-reload': () => {
        initBrowser()
    }
}
