const { series } = require('gulp')
const tasks = require('./utils')
const test = (cb) => {
    console.log('test fn')
    cb()
}

const test2 = (cb) => {
    console.log('build fn')
    cb()
}

const watchTasks = (cb) => {
    console.log('watch', cb)
    cb()
}

  
exports.build = series(test2, test)

exports.watch = series(tasks['validate:id'], tasks['build:config'], watchTasks)