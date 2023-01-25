/**
 * all task going to register here
 */
import Gulp from 'gulp'
import config_jobs from './build/config.js'
import assets_jobs from './build/assets.js'
import svg_jobs from './build/svg.js'
import css_jobs from './build/css.js'
import js_jobs from './build/js.js'
import deploy_jobs from './build/deploy.js'
import util_jobs from './build/utils.js'

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

task('test', series(test2, test))

task('watch', series(
    config_jobs['validate:id'],
    config_jobs['build:config'],

    // observers
    parallel(
        assets_jobs['watch:assets'],
        config_jobs['watch:config'],
        svg_jobs['watch:svg'],
        css_jobs['watch:css'],
        js_jobs['watch:js'],
        js_jobs['watch:vendor-js'],
        deploy_jobs['watch:dist']
    ),
))

task('build', series(
    util_jobs['clean'],
    assets_jobs['build:assets'],
    svg_jobs['build:svg'],
    js_jobs['build:js'],
))


task('deploy', series(
    config_jobs['validate:id'],
    config_jobs['build:config'],
    'build',
    deploy_jobs['deploy:dist']
))
