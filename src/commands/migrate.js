import enquirer from 'enquirer'
import {
    logger,
    isShopifyTheme,
    writePackageJsonSync,
    move,
    isShopifyThemeSettingsFile,
    downloadFromUrl,
    beautifyJson, isShopifyThemeWhitelistDir
} from '../utils.js'
import {join} from 'path'
import {existsSync, mkdirSync, readdirSync} from 'fs'
import figures from 'figures'


export default function (cli) {
    cli.command('migrate')
        .description('Converts an existing theme to work with Slate Structure.')
        .option('--npm', 'installs theme dependencies with npm instead of yarn')
        .action(async (options = {}) => {
            const workingDirectory = process.cwd()
            const {confirm} = enquirer
            let answer = await confirm({
                message: "Warning! This will change your theme's folder structure. Are you sure you want to proceed?"
            })

            if (!answer) return

            // check project structure
            if (!isShopifyTheme(workingDirectory)) {
                logger.warming("The current directory doesn't have /layout/theme.liquid. We have to assume this isn't a Shopify theme\n")
                logger.error('Migration failed\n', figures.cross)
                return
            }

            const configYml = join(workingDirectory, 'config.yml')
            const pkgJson = join(workingDirectory, 'package.json')
            const srcDir = join(workingDirectory, 'src')
            const configDir = join(workingDirectory, 'src', 'config')
            const iconsDir = join(srcDir, 'icons')
            const stylesDir = join(srcDir, 'styles')
            const scriptsDir = join(srcDir, 'scripts')

            console.log(`\n  ${figures.tick} Your theme is a valid Shopify theme \n`)
            if (existsSync(srcDir)) {
                logger.warming('Migrate task could not create a new src directory since your already has one\n')
                logger.warming('Please remove or rename your current src directory\n')
                logger.error('Migration failed\n', figures.cross)
                return
            }

            logger.success('Migration checks completed\n', figures.tick)
            logger.info('Starting migration...\n')

            mkdirSync(srcDir)
            mkdirSync(iconsDir)
            mkdirSync(stylesDir)
            mkdirSync(scriptsDir)

            // @todo write package json
            if (!existsSync(pkgJson)) writePackageJsonSync(pkgJson)

            // Move
            const movePromiseFactory = (file) => {
                logger.info(`Migrating ${file} to src/...`)
                return move(join(workingDirectory, file), join(srcDir, file))
            }

            // unminify JSON
            const unminifyJsonPromiseFactory = (file) => beautifyJson(join(configDir, file));

            try {
                let files = readdirSync(workingDirectory)
                const movePromises = files.filter(isShopifyThemeWhitelistDir).map(movePromiseFactory)
                await Promise.all(movePromises)

                logger.success('Migration to src/ completed\n', figures.tick)

                const configDirFiles = readdirSync(configDir).filter(isShopifyThemeSettingsFile)
                const unminifyPromises = configDirFiles.map(unminifyJsonPromiseFactory)
                await Promise.all(unminifyPromises)

                // @todo install dependencies
                logger.info(`@todo install the dependence using ${options.npm}`)
                // log(`\n  ${chalk.green(figures.tick)} Slate dependencies installed\n`)

                // generate config.yml
                if (!existsSync(configYml)) {
                    await downloadFromUrl(
                        'https://raw.githubusercontent.com/Shopify/slate/0.x/packages/slate-theme/config-sample.yml',
                        configYml
                    )

                    logger.success('Configuration file generated', figures.tick)
                    logger.warming('Your theme was missing config.yml in the root directory. Please open and edit it before using Slate commands\n')
                }

                logger.success('Migration complete!\n', figures.tick)
            } catch (err) {
                logger.warming(`${err}`)
                logger.error('Migration failed. Please check src/ directory\n', figures.cross)
            }
        })
}
