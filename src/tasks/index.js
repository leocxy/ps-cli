import Gulp from 'gulp'
const { task, series } = Gulp
// const tasks = require('./utils')
const test = (cb) => {
    console.log('test fn')
    cb()
}

const test2 = (cb) => {
    console.log('build fn')
    cb()
}

task('default', series(test2, test))



// exports.build = series(test2, test)

// exports.watch = series(tasks['validate:id'], tasks['build:config'], watchTasks)
