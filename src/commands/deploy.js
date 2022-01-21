import {spawn} from 'cross-spawn'
import Debug from 'debug'
import {config} from "../utils.js";

const debug = Debug('1')

export default function (cli) {
    cli.command('deploy')
        .alias('d')
        .description('Runs a full deploy of your theme\'s code to a Shopify store specified in config.yml. Existing files will be overwritten.')
        .option('-e, --env <environment>', 'Shopify store to deploy code to (specified in config.yml - default: development)', 'development')
        .action((options = {}) => {
            debug(`--gulpfile ${config.gulpFile}`)
            debug(`--cwd ${config.themeRoot}`)
            debug(options)

            spawn(config.gulp, [
                'deploy',
                '--gulpfile', config.gulpFile,
                '--cwd', config.themeRoot,
                '--env', options.env], {stdio: 'inherit'})
        })
}
