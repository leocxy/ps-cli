import {readFileSync} from 'fs'
import {load} from 'js-yaml'
import plumber from 'gulp-plumber'
import size from 'gulp-size'
import {commonConfig, slateConfig} from '../config.js'
import {logger} from '../../utils.js'
import {watch, dest, src} from '../helper.js'

/**
 * Validate theme_id used for the environment
 * @param {Object} - settings of theme_id and environment
 * @returns {Promise}
 * @private
 */
const validateId = (settings) => {
    return new Promise((resolve, reject) => {
        if (settings.theme_id === 'live') resolve()
        const id = Number(settings.theme_id)
        isNaN(id) ? reject(settings) : resolve()
    })
}

const checkConfigs = () => {
    try {
        let file = readFileSync(commonConfig.tkConfig, 'utf-8')
        let tkConfig = load(file)
        const promises = []

        Object.keys(tkConfig).forEach(env => {
            promises.push(validateId({theme_id: tkConfig[env].theme_id, env: env}))
        })

        return Promise.all(promises).then(() => {
            return new Promise((resolve, reject) => {
                if (Object.keys(tkConfig).indexOf(slateConfig.env) === -1) reject(`Environment: ${slateConfig.env} does not exists!`)
                slateConfig.ignoreFiles = tkConfig[slateConfig.env]?.ignore_files || []
                resolve()
            })
        }).catch(err => {
            if (typeof (err) === 'object') {
                logger.invalidThemeId(err.theme_id, err.env)
            } else {
                logger.error(err)
            }
            throw new Error('Exit by error!')
        })
    } catch (err) {
        if (err.code != 'ENOENT') throw new Error(err)
        logger.configError()
        throw new Error('An Error Occurred')
    }
}

/**
 * Process the config.yml
 * @param {String} file
 * @returns
 */
const processConfig = (file) => {
    return src(file)
        .pipe(plumber(logger.plumberErrorHandle))
        .pipe(size({showFiles: true}))
        .pipe(dest(commonConfig.dist.root))
}

export default {
    /**
     * Validate the config.yml theme_id is an integer or "live"
     * @function validateConfig
     * @memberof watch
     * @private
     */
    'validate:id': () => {
        return checkConfigs()
    },
    /**
     * ThemeKit requires the config file to be in the `root` directory for files it
     * will be uploading to our store.  As such we need to move this file to `./dist`
     * before running any deployment tasks.
     *
     * @function build:config
     * @memberof slate-cli.tasks.build
     * @static
     */
    'build:config': () => {
        logger.processFiles('build:config')
        return checkConfigs().then(() => {
            return processConfig(commonConfig.tkConfig)
        })
    },
    /**
     * Watch the config file in our `src/` folder and move it to `dist/`
     * Watches the config file in our dist folder and throw an error to stop all tasks
     * or watchers when it changes. Otherwise, themeKit will quietly start uploading
     * files to the new shops defined in `dist/config.yml` with no warning to the user
     *
     * @function watch:config
     * @memberof slate-cli.tasks.watch
     * @static
     */
    'watch:config': () => {
        logger.processFiles('watch:config')

        watch(commonConfig.tkConfig, {
            ignoreInitial: true
        }).on('all', (event, path) => {
            logger.fileEvent(event, path)
            return checkConfigs().then(() => {
                return processConfig(path)
            })
        })
    },
}
