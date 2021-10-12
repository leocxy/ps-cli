// Register All commands
module.exports = (cli, figures) => {
    require('./migrate')(cli, figures)
    require('./theme')(cli, figures)
}