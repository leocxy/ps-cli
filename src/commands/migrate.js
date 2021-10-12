const chalk = require('chalk')
const { Confirm } = require('enquirer')
const utils = require('../utils')
const {join} = require('path')
const { existsSync, mkdirSync, readdirSync } = require('fs')
const log = console.log


module.exports = (cli, figures) => {
    cli.command('migrate')
        .description('Converts an existing theme to work with Slate Structure.')
        .option('--npm', 'installs theme dependencies with npm instead of yarn')
        .action(async (options = {}) => {
            const workingDirectory = process.cwd()
            let answer = await new Confirm({
                message: "  Warning! This will change your theme's folder structure. Are you sure you want to proceed?"
            }).run()

            if (!answer) return

            // check project structure
            if (!utils.isShopifyTheme(workingDirectory)) {
                log(chalk.yellowBright("  The current directory doesn't have /layout/theme.liquid. We have to assume this isn't a Shopify theme\n"))
                log(chalk.redBright(`  ${figures.cross} Migration failed\n`))
                return
            }

            const configYml = join(workingDirectory, 'config.yml')
            const pkgJson = join(workingDirectory, 'package.json')
            const srcDir = join(workingDirectory, 'src')
            const configDir = join(workingDirectory, 'src/config')
            const iconsDir = join(srcDir, 'icons')
            const stylesDir = join(srcDir, 'styles')
            const scriptsDir = join(srcDir, 'scripts')

            console.log(`\n  ${figures.tick} Your theme is a valid Shopify theme \n`)
            if (existsSync(srcDir)) {
                log(chalk.yellowBright('  Migrate task could not create a new src directory since your already has one\n'))
                log(chalk.yellowBright('  Please remove or rename your current src directory\n'))
                log(chalk.redBright(`  ${figures.cross} Migration failed\n`))
                return
            }

            log(`  ${chalk.green(figures.tick)} Migration checks completed\n`)
            log(chalk.whiteBright('  Starting migration...\n'));

            mkdirSync(srcDir)
            mkdirSync(iconsDir)
            mkdirSync(stylesDir)
            mkdirSync(scriptsDir)

            // @todo write package json
            if (!existsSync(pkgJson)) utils.writePackageJsonSync(pkgJson)

            const movePromiseFactory = (file) => {
                log(`  Migrating ${file} to src/...`)
                return utils.move(join(workingDirectory, file), join(srcDir, file))
            }

            let files = readdirSync(workingDirectory)
            const movePromises = files.filter(utils.isShpoifyThemeWhitelistDir).map(movePromiseFactory)


            const unminifyJsonPromiseFactory = (file) => utils.unminifyJson(join(configDir, file));

            const configDirFiels = readdirSync(configDir)
            const unminifyPromises = configDirFiels.filter(utils.isShopifyThemeSettingsFile).map(unminifyJsonPromiseFactory)

            try {
                await Promise.all(movePromises)

                log(`  ${chalk.green(figures.tick)} Migration to src/ completed\n`)

                await Promise.all(unminifyPromises)

                // @todo install dependencies
                log(chalk.bgRed(`@todo install the dependence using ${options.npm}`))
                // log(`\n  ${chalk.green(figures.tick)} Slate dependencies installed\n`)

                // generate config.yml
                if (!existsSync(configYml)) {
                    await utils.downloadFromUrl(
                        'https://raw.githubusercontent.com/Shopify/slate/0.x/packages/slate-theme/config-sample.yml',
                        configYml
                    )

                    log(`  ${chalk.green(figures.tick)} Configuration file generated`)
                    log(chalk.yellowBright('  Your theme was missing config.yml in the root directory. Please open and edit it before using Slate commands\n'))
                }

                log(`  ${chalk.green(figures.tick)} Migration complete!\n`)
            } catch (err) {
                log(chalk.yellowBright(`\n  ${err}\n`))
                log(chalk.redBright(`  ${figures.cross} Migration failed. Please check src/ directory\n`))
            }
        })
}