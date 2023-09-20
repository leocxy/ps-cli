#!/usr/bin/env node
// eslint-disable-next-line node/shebang
import {readFileSync} from 'fs'
import {join, normalize} from 'path'
import chalk from 'chalk'
import figures from 'figures'
import updateNotifier from 'update-notifier'
import { Command } from 'commander/esm.mjs';
import { config } from './utils.js'

const pkg = JSON.parse(readFileSync(join(config.currentDirectory, normalize('../package.json'))));
const cli = new Command()
const log = console.log

/**
 * Output information if/else slate theme directory.
 *
 * @param {boolean} isSlateTheme - Whether in slate theme or not.
 */
const outputSlateThemeCheck = (isSlateTheme) => {
    if (isSlateTheme) return
    log(chalk.bgGray('Error:'))
    log(chalk.yellow(`  ${figures.cross} You are not in a slate theme directory`));
    log('  For a full list of commands, generate a new theme or switch to an existing slate theme directory\n');
}

// Notify for updates every 1 day
updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24,
}).notify();


// register commands
import cli_generator from './commands/theme-generator.js'
import cli_migrate from './commands/migrate.js'
import cli_watch from './commands/watch.js'
import cli_build from './commands/build.js'
import cli_deploy from './commands/deploy.js'
import cli_list from './commands/list.js'
import cli_pull from './commands/pull.js'


cli_generator(cli)
cli_migrate(cli)
cli_watch(cli)
cli_build(cli)
cli_deploy(cli)
cli_list(cli)
cli_pull(cli)

// @todo update
cli.addHelpText('before', () => outputSlateThemeCheck(false))

cli.addHelpText('after', () => {
    log('\nDocs:\n')
    log(chalk.whiteBright('  https://shopify.github.io/slate/'))
    log(chalk.whiteBright('  PS: Seriously, I don’t like writing documents!'))
})

cli.on('*', () => {
    log(chalk.red(`\n  ${figures.cross} Unknown command: ${cli.args.join(' ')}\n`));
    cli.help();
})

// Execute the commands
if (!process.argv.slice(2).length) {
    cli.help();
} else {
    cli.parse(process.argv);
}
