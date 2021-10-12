const {existsSync, mkdirSync} = require('fs')
const { join } = require('path')
const { prompt } = require('enquirer')
const chalk = require('chalk')
const log = console.log
const utils = require('../utils')

module.exports = (cli, figures) => {
    cli.command('theme [name]')
        .description("Generates a new theme directory containing Slate's theme boilerplate.")
        .option('--npm', 'install theme dependencies with npm instaed of npm')
        .action(async (name, options={}) => {
            let dirName = name
            if (!dirName) {
                dirName = await prompt({
                    type: 'input',
                    name: 'dirName',
                    message: 'Please enter a directory name for your theme (a new folder will be created):',
                    default: 'theme',
                    validate: (value) => {
                        if (value.match(/^[\w^'@{}[\],$=!#().%+~\- ]+$/)) return true
                        return 'A directory name is required.'
                    }
                })
                dirName = dirName.dirName
            }

            const workingDirectory = process.cwd()
            // @todo config for this url
            const s3Url = 'http://sdks.shopifycdn.com/slate/latest/slate-src.zip';
            const root = join(workingDirectory, dirName);

            if (existsSync(root)) return log(chalk.redBright(`  ${figures.cross} The ${root} directory already exists`))

            log('  this may take some time...\n')

            mkdirSync(root)

            return utils.downloadFromUrl(s3Url, join(root, 'starter-theme.zip'))
                .then((file) => utils.unzip(file, root))
                .then(() => {
                    log(`  ${chalk.green(figures.tick)} starter-theme download completed\n`)
                    // generate package.json file
                    const pkg = join(root, 'package.json')
                    utils.writePackageJsonSync(pkg, dirName)

                    // @todo install dependencies
                    log('Install the packages', options.npm)
                })
        })
}