import { spawn } from 'cross-spawn'
import Debug from 'debug'
import {config} from '../utils.js'
const debug = Debug('1')

export default function (cli) {
    cli.command('test')
    .description('devloper testing something')
    .option('-l, --liquid', "liquid files only")
    .option('-g, --locale', "locales only")
    .action((options = {}) => {
        debug(`--gulpfile ${config.gulpFile}`)
            debug(`--cwd ${config.themeRoot}`)
            debug(options)

            spawn(config.gulp, ['test', '--gulpfile', config.gulpFile, '--cwd', config.themeRoot, '--env', options.env], { stdio: 'inherit'})
    })
}
