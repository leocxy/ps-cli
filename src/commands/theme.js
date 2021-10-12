module.exports = (cli) => {
    cli.command('theme [name]')
        .alias('t')
        .description("Generates a new theme directory containing Slate's theme boilerplate.")
        .option('--npm', 'install theme dependencies with npm instaed of npm')
        .action(async (name, options={}) => {
            console.log(name, options, 'action')
        })
}