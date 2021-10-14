// Register All commands
module.exports = (cli, figures) => {
    require('./version')(cli)
    require('./migrate')(cli, figures)
    require('./theme')(cli, figures)
    require('./watch')(cli)
    // require('./test')(cli)
    require('./build')(cli) 

}