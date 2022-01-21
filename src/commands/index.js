import generator from './theme-generator.js'
import migrate from './migrate.js'
// import test from './test.js'
import watch from './watch.js'

// // Register All commands
// export default function(cli, figures) {
//     // require('./migrate')(cli, figures)
//     // require('./theme-generator')(cli, figures)
//     // require('./watch')(cli)
//     test(cli)
//     // require('./build')(cli)
// }

export default function(cli) {
    migrate(cli)
    generator(cli)
    watch(cli)
    // test(cli)
}
