/**
 * all task going to register here
 */
import Gulp from 'gulp'
import config_jobs from './build/config.js'
import assets_jobs from './build/assets.js'
console.log(assets_jobs, config_jobs)
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

task('watch', series(
    config_jobs['validate:id'],
    config_jobs['build:config'],
    // observers
    assets_jobs['watch:assets'],
    // config_jobs['watch:config'],

))
