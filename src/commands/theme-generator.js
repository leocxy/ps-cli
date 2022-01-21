import {existsSync, mkdirSync} from 'fs'
import { join } from 'path'
import Enquirer from 'enquirer'
import utils from '../utils.js'
import figures from 'figures'
const { logger, downloadFromUrl, writePackageJsonSync, unzip } = utils
const { prompt } = Enquirer

export default function (cli) {
    cli.command('generate [name]')
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

            if (existsSync(root)) return logger.error(`The ${root} directory already exists`, figures.cross)

            logger.info('this may take some time...\n')

            mkdirSync(root)

            return downloadFromUrl(s3Url, join(root, 'starter-theme.zip'))
                .then((file) => unzip(file, root))
                .then(() => {
                    logger.success('starter-theme download completed\n', figures.tick)
                    // generate package.json file
                    const pkg = join(root, 'package.json')
                    writePackageJsonSync(pkg, dirName)

                    // @todo install dependencies
                    logger.info('Install the packages')
                    logger.info(options.npm)
                })
        })
}
