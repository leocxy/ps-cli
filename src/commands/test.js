export default function (cli) {
    cli.command('test')
    .description('Runs translation tests for a theme\'s locale files (<theme>/src/locales/).\nRun liquid syntax check for a theme\'s liquid files')
    .option('-l, --liquid', "liquid files only")
    .option('-g, --locale', "locales only")
    .action((options = {}) => {
        console.log(options)
    })
}
