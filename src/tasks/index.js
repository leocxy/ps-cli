/**
 * all task going to register here
 */
import Gulp from 'gulp'
import config_jobs from './build/config.js'
import assets_jobs from './build/assets.js'
import svg_jobs from './build/svg.js'
const { task, series, parallel } = Gulp
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

task('watch', series(
    config_jobs['validate:id'],
    config_jobs['build:config'],
    // observers
    parallel(
        assets_jobs['watch:assets'],
        config_jobs['watch:config'],
        svg_jobs['watch:svg'],
//   'watch:css',
//   'watch:js',
//   'watch:vendor-js',
    )
))
