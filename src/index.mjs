#!/usr/bin/env node
import {readFileSync} from 'fs'
import {join, normalize, dirname} from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import figures from 'figures'
import findRoot from 'find-root'
import updateNotifier from 'update-notifier'
import { Command } from 'commander/esm.mjs';

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const workingDirectory = process.cwd();
const pkg = JSON.parse(readFileSync(join(currentDirectory, normalize('../package.json'))));
const themeRoot = getThemeRoot(workingDirectory)
const cli = new Command()
const log = console.log

/**
 * Find closest package.json to be at root of theme.
 *
 * @param {string} directory - A path.
 */
function getThemeRoot(directory) {
    try {
        return normalize(findRoot(directory));
    } catch (err) {
        return null;
    }
}

/**
 * Output information if/else slate theme directory.
 *
 * @param {boolean} isSlateTheme - Whether in slate theme or not.
 */
function outputSlateThemeCheck(isSlateTheme) {
    if (isSlateTheme) return
    log(chalk.bgGray('Error:'))
    log(chalk.yellow(`  ${figures.cross} You are not in a slate theme directory`));
    log('  For a full list of commands, generate a new theme or switch to an existing slate theme directory\n');
}



console.log(chalk.red(themeRoot))

// Notify for updates every 1 day
updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24,
}).notify();


// register commands
import commandRegister from './commands/index.js'
commandRegister(cli, figures)

// @todo update
cli.addHelpText('before', () => outputSlateThemeCheck(false))

cli.addHelpText('after', () => {
    log('\nDocs:\n')
    log(chalk.whiteBright('  https://shopify.github.io/slate/\n'))
})

cli.on('*', () => {
    log('');
    log(chalk.red(`  ${figures.cross} Unknown command: ${cli.args.join(' ')}`));
    log('');
    cli.help();
})

// Execute the commands
cli.parse(process.argv);

if (!process.argv.slice(2).length) {
    cli.help();
}