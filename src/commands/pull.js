import {spawn} from "cross-spawn";
import Debug from 'debug'
import {config} from '../utils.js'

const debug = Debug('1')

export default function (cli) {
    cli.command('pull')
        .alias('p')
        .description('Downloads the theme from your Shopify store.')
        .option('-e, --env <environment>', 'Shopify store to download theme from (specified in config.yml - default: development)', 'development')
        .option('-d, --dir <directory>', 'Directory to download theme to (default: ./)', './')
        .action((options = {}) => {
            debug(`--gulpfile ${config.gulpFile}`)
            debug(`--cwd ${config.themeRoot}`)
            debug(options)

            spawn(config.gulp, [
                'pull',
                '--gulpfile', config.gulpFile,
                '--cwd', config.themeRoot,
                '--dir', options.dir,
                '--env', options.env], {stdio: 'inherit'})
        })
}
