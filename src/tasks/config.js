import { config } from '../utils.js'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { merge } from 'webpack-merge'
const pkg = readFileSync(join(config.themeRoot, 'package.json'))
/**
 * common configuration
 *
 *  @prop {String} packageJson - path to package.json file
 *  @prop {String} themeRoot - path to working directory
 *  @prop {String} tkconfig - path to themekit config file
 *  @prop {Object} dist - paths to relevant folder locations in the distributable directory
 */
let commonConfig = {
    packageJson: pkg,
    themeRoot: config.themeRoot,
    tkConfig: join(config.themeRoot, 'config.yml'),
    dist: {
        root: 'dist/',
        assets: 'dist/assets/',
        snippets: 'dist/snippets/',
        sections: 'dist/sections/',
        layout: 'dist/layout/',
        templates: 'dist/templates/',
        locales: 'dist/locales/',
    }
}
/**
 * slate-cli configuration object
 * ## Markdown stuff
 *
 * It's a big description written in `markdown`
 *
 * Example:
 *
 * ```javascript
 * $('something')
 *   .something(else);
 * ```
 *
 * @namespace salteConfig
 * @memberof slate-cli
 * @summary Configuring slate-cli
 *  @prop {String} environment - development | staging | production
 *  @prop {String} scssLintConfig - path to scss-lint config file
 *  @prop {String} deployLog - path to deploy log file
 *  @prop {String} src - globs (multi-filename matching patterns) for various source files
 *  @prop {Object} roots - array of "root" (entry point) JS & CSS files
 *  @prop {Object} plugins - configuration objects passed to various plugins used in the task interface
 */
let slateConfig = {
    deployLog: join(config.themeRoot, 'deploy.log'),
    src: {
        root: 'src/',
        js: 'src/scripts/**/*.{js,js.liquid}',
        vendorJs: 'src/scripts/vendor/*.js',
        json: 'src/**/*.json',
        css: 'src/styles/**/*.{css,scss,scss.liquid}',
        cssLint: 'src/styles/**/*.{css,scss}',
        vendorCss: 'src/styles/vendor/*.{css,scss}',
        assets: 'src/assets/**/*',
        icons: 'src/icons/**/*.svg',
        templates: 'src/templates/**/*.{liquid,json}',
        snippets: 'src/snippets/*.liquid',
        sections: 'src/sections/*.liquid',
        locales: 'src/locales/*.json',
        config: 'src/config/*.json',
        layout: 'src/layout/*.liquid',
    },
    roots: {
        js: 'src/scripts/*.{js,js.liquid}',
        vendorJs: 'src/scripts/vendor.js',
        css: 'src/styles/*.{css,scss}'
    },
    plugins: {
        svgmin: {multipass: true},
        babel: ['@babel/transform-runtime'],
        uglify: {
            theme: {},
            vendor: {
                mangle: true,
                compress: true,
                output: { comments: 'some' }
            }
        }
    }
}
const slateConfigJS = join(config.themeRoot, 'slate.config.js')
if (existsSync(slateConfigJS)) {
    slateConfig = merge(slateConfig, readFileSync(slateConfigJS))
}

export {
    commonConfig,
    slateConfig
}
