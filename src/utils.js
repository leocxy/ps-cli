const {join, normalize, resolve} = require('path')
const {existsSync, writeFileSync, readFileSync, createWriteStream, unlinkSync, createReadStream} = require('fs')
const {Extract} = require('unzip-stream')
const mv = require('mv')
const { get } = require('http')
const findRoot = require('find-root')
const log = require('fancy-log')
const chalk = require('chalk')
const currentDirectory = __dirname
const workingDirectory = process.cwd()
const themeRoot = findRoot(workingDirectory)
const defualtGulpPath = join(themeRoot, normalize('node_modules/.bin/gulp'))
const legacyGulpPath = join(themeRoot, normalize('node_modules/@leocxy/slate/node_modules/.bin/gulp'))

/**
 * Separates filename and directory from a path string. Returns an object containing both.
 *
 * @param path {String} - a string representing the path to a file
 * @returns {Object} - an object with separated `file` (the filename) and `dir` (path minus filename) properties
 * @private
 */
const separatePath = (path) => {
    let tmp = path.split('/')
    return {
        file: tmp.pop(),
        dir: tmp.join('/')
    }
}


module.exports = {
    /**
     * Tests if directory is a Shopify theme
     *
     * @param {string} directory - The path to the directory.
     */
    isShopifyTheme: (dir) => {
        const layoutFile = join(dir, normalize('layout/theme.liquid'))
        return existsSync(layoutFile)
    },
    /**
     * Write minimal package.json to destination.
     *
     * @param {string} target - The path to the target package.json.
     * @param {string} name - The name of the theme.
     */
    writePackageJsonSync: (target, name = 'theme') => {
        writeFileSync(target, JSON.stringify({
            name,
            version: '0.1.0',
            engineStrict: true,
            engines: {
                node: "^14.17.0 || >=16.0.0",
                yarn: "1.x"
            },
            resolutions: {
                "graceful-fs": "^4.2.4"
            },
            scripts: {
                clean: "yarn rimraf dist/",
                watch: "yarn slate watch -e",
                build: "yarn slate build",
                deploy: "yarn clean && yarn build"
            }
        }, null, 4))
    },
    /**
     * Moves file from one location to another
     *
     * @param {string} oldPath - The path to the file.
     * @param {string} newPath - The path to the new file.
     */
    move: (oldPath, newPath) => {
        return new Promise((resolve, reject => {
            mv(oldPath, newPath, {mkdirp: true}, (err) => {
                if (err) return reject(err)
                resolve()
            })
        }))
    },
    /**
     * Tests if directory belongs to Shopify themes
     *
     * @param {string} directory - The path to the directory.
     */
    isShpoifyThemeWhitelistDir: (directory) => {
        return ['assets', 'layout', 'config', 'locales', 'sections', 'snippets', 'templates'].indexOf(directory) !== -1
    },
    /**
     * Umminify a JSON file
     *
     * @param {string} file - The path to the file to unminify
     */
    unminifyJson: (file) => new Promise((resolve, reject) => {
        try {
            const jsonString = readFileSync(file)
            const unminifyJsonString = JSON.stringify(JSON.parse(jsonString), null, 4)
            writeFileSync(file, unminifyJsonString)
            resolve()
        } catch (err) {
            reject(err)
        }
    }),
    /**
     * Tests if file is a Shopify theme settings file (settings_*.json)
     *
     * @param {string} file - The path to the file.
     */
     isShopifyThemeSettingsFile: (file) => /^settings_.+\.json/.test(file),
    /**
     * Download file from url and write to target.
     *
     * @param {string} source - The url to the file to download.
     * @param {string} target - The path to the file destination.
     *
     * @return {string} - The path to the file destination.
     */
     downloadFromUrl: (source, target) => {
        return new Promise((resolve, reject) => {
            const targetFile = createWriteStream(target)

            targetFile.on('open', () => {
                get(source, (response) => {
                    response.pipe(targetFile)
                })
            })

            targetFile.on('error', (err) => {
                unlinkSync(target)
                reject(err)
            })

            targetFile.on('close', () => resolve(target))
        })
     },
     /**
     * Extract zip file to target and unlink zip file.
     *
     * @param {string} source - The path to the zip file.
     * @param {string} target - The path to the unzip destination.
     */
    unzip: (source, target) => {
        return new Promise((resolve, reject) => {
            const zipFile = createReadStream(source)

            zipFile.on('error', (err) => reject(err))

            zipFile.on('close', () => {
                unlinkSync(source)
                resolve(target)
            })

            zipFile.pipe(Extract({ path: target }))
        })
    },
    /**
     * Find closest package.json to be at root of theme.
     *
     * @param {string} directory - A path.
     */
    getThemeRoot: (directory) => {
        try {
            return normalize(findRoot(directory))
        } catch (err) {
            return null
        }
    },
    /**
     * Fancy logger
     */
    logger: {
        info: (msg, symbol = null) => {
            msg = (symbol ? symbol + ' ' : '') + msg
            log(`  ${chalk.whiteBright(msg)}`)
        },
        success: (msg, symbol = null) => {
            msg = (symbol ? symbol + ' ' : '') + msg
            log(`  ${chalk.greenBright(msg)}`)
        },
        warming: (msg, symbol = null) => {
            msg = (symbol ? symbol + ' ' : '') + msg
            log(`  ${chalk.yellowBright(msg)}`)
        },
        error: (msg, symbol = null) => {
            msg = (symbol ? symbol + ' ' : '') + msg
            log(`  ${chalk.redBright(msg)}`)
        },
        fileEvent: (event, path) => {
            const pathObj = separatePath(path)
            log('change in', chalk.magenta(pathObj.dir), chalk.white('-'), chalk.cyan(event), chalk.yellow(pathObj.file))
        },
        configError: () => {
            log('File missing:', chalk.yellow('`config.yml` does not exist. You need to add a config file before you can make changes to your Shopify store.'))
        },
        invalidThemeId: (themeId, env) => {
            log('Invalid theme id for', chalk.cyan(`Environment[${env}]:${themeId}`), chalk.yellow('`theme_id` must be an integer or "live".'))
        },
        processFiles: (processName) => {
            log('running task', chalk.white('-'), chalk.cyan(processName))
        },
        plumberErrorHandle: (err) => {
            log(chalk.red(err))
        }
    }
}

module.exports.config = {
    currentDirectory, workingDirectory, themeRoot,
    gulpFile: join(currentDirectory, './tasks/index.js'),
    gulp: existsSync(defualtGulpPath) ? defualtGulpPath : legacyGulpPath
}
