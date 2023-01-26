import {spawn} from 'cross-spawn'
import Debug from 'debug'
import {config} from '../utils.js'

const debug = Debug('1')

export default function (cli) {
    cli.command('watch')
        .alias('w')
        .description('Watches files for code changes and immediately deploys updates to your store as they occur.\nBy default, this command also runs a live-reload proxy that refreshes your store URL in-browser when changes are successfully deployed.')
        .option('-e, --env <environment>', 'Shopify store to deploy code to (specified in config.yml - default: development)', 'development')
        .action((options = {}) => {
            debug(`--gulpfile ${config.gulpFile}`)
            debug(`--cwd ${config.themeRoot}`)
            debug(options)

            spawn(config.gulp, [
                'watch',
                '--gulpfile', config.gulpFile,
                '--cwd', config.themeRoot,
                '--env', options.env], {stdio: 'inherit'})
        })
}
