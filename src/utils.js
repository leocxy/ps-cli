const {join, normalize, resolve} = require('path')
const {existsSync, writeFileSync, readFileSync} = require('fs')
const mv = require('mv')

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
            version: '0.1.0'
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
     
}