import {spawn} from 'cross-spawn'
import Debug from 'debug'
import {config} from "../utils.js";

const debug = Debug('1')

export default function (cli) {
    cli.command('build')
        .alias('b')
        .description('Compiles source files (<theme>/src/) into the format required for distribution to a Shopify store (<theme>/dist/). Default build with slate')
        .option('-s, --slate', 'build with slate (default)')
        .option('-w, --webpack', 'build with webpack')
        .action((options = {}) => {
            debug(`--gulpfile ${config.gulpFile}`)
            debug(`--cwd ${config.themeRoot}`)
            debug(options)

            spawn(config.gulp, ['build', '--gulpfile', config.gulpFile, '--cwd', config.themeRoot], {stdio: 'inherit'})
        })
}
