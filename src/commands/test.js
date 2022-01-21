
// const { config } = require('../utils')
// const debug = require('debug')('1')

export default function (cli) {
    cli.command('test')
    .description('Runs translation tests for a theme\'s locale files (<theme>/src/locales/).\nRun liquid syntax check for a theme\'s liquid files')
    .option('-l, --liquid', "liquid files only")
    .option('-g, --locale', "locales only")
    .action((options = {}) => {
        // debug(`--gulpfile ${config.gulpFile}`)
        // debug(`--cwd ${config.themeRoot}`)
        // let actions = 0
        // options?.liquid ? actions += 1 << 0 : null
        // options?.locale ? actions += 1 << 1 : null
        // switch (actions) {
        //     case 0:
        //     case 3:
        //         debug('Check liquid and locale files')
        //         break
        //     case 1:
        //         debug('Only check liquid files')
        //         break
        //     case 2:
        //         debug('Only check locale files')
        //         break
        // }
    })
}
