## Brief

Refactored [Shopify Slate 0.14.0](https://www.npmjs.com/package/@shopify/slate),
replace the deploy method with Shopify Theme Kit and update the dependencies.
So you can use the latest version of Node.js and NPM.

Table of contents
=================

<!--ts-->

* [Installation](#Installation)
* [Usage](#Usage)
* [Tests](#Tests)
* [Common Issues](#Common-Issues)
* [Change Logs](#Change-Logs)

<!--te-->

## Installation

```shell
# npm
>npm i @leocxy/ps-cli
# yarn
>yarn add @leocxy/ps-cli
```

## Usage

| Command             | Usage                     |
|---------------------|:--------------------------|
| [migrate](#migrate) | slate migrate [--options] |
| [watch/w](#watch)   | slate watch [--options]   |
| [build/b](#build)   | slate build [--options]   |
| [deploy/d](#deploy) | slate deploy [--options]  |
| [theme/t](#theme)   | slate theme [--options]   |
| [pull/p](#pull)     | slate pull [--options]    |


### migrate

```shell
# npm
>npm slate migrate
# yarn
>yarn slate migrate
```

Converts an existing theme to work with Slate Structure.

### watch

```shell
# npm
>npm slate watch [--options]
>npm slate w [--options]
# yarn
>yarn slate watch [--options]
>yarn slate w [--options]
```

Sets up the watchers for all theme assets and deploys the compiled versions to your shop.

### build

```shell
# npm
>npm slate build
>npm slate b
# yarn
>yarn slate build
>yarn slate b
```

Compiles your theme files and assets into a Shopify theme, found in the dist folder. No files will be uploaded to your shop.

### deploy

```shell
# npm
>npm slate deploy [--options]
>npm slate d [--options]
# yarn
>yarn slate deploy [--options]
>yarn slate d [--options]
```

Performs a fresh build followed by a full deploy; replacing existing files on the remote server and replacing them with the full set of build files, and removing remote files that are no longer in use.

### theme

```shell
# npm
>npm slate theme [--options]
>npm slate t [--options]
# yarn
>yarn slate theme [--options]
>yarn slate t [--options]
```

List all themes in your store.

### pull

```shell
# npm
>npm slate pull [--options]
>npm slate p [--options]
# yarn
>yarn slate pull [--options]
>yarn slate p [--options]
```

Pull specific theme from your store to your local machine.

## Tests

For some reason, you might want to fork this project and refactor it. You can test it with the following command.

```shell
# at the root folder
>node ./src/index.js

# test the bin with build file
>node ./dist/index.js

# enable debug message
>DEBUG=1 node ./src/index.js
```

## Common Issues

### Mac M1/M2 Chip

The Shopify ThemeKit is not natively support the Apple M1/M2 chip.
You might need to turn on [Rosetta](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment) mode to run the ThemeKit.

### fsevents

You might see this error message when you install the package. 
It is not impacted the package. Because I an not using the `fsevents` in this package.

```text
warning Error running install script for optional dependency: "/xx/xxx/node_modules/gulp/node_modules/fsevents: Command failed.
```

## Change Logs
0.16.10 -> Fixed Windows compatibility issues.

0.16.9 -> Bump up the dependencies

0.16.8 → Updated dependencies, and update the `README.md` 

0.16.7 → `live` will not consider as a valid `theme_id` anymore. (config.yml)

0.16.6 → Fixed “scripts/vendor.js” does not exist will raise an error issue

0.16.5 → Add “download” command

0.16.4 → Fixed SASS warning message

0.16.3 → Fixed SASS compiled as CSS, file extension issue

0.16.1 → All “styles/*.{sass,sass.liquid}” will compiled as “assets/*.{css,css.liquid}”

0.15.9 → Fixed JS configuration issue

0.15.8 → Support Section Group “sections/*.json”

0.15.7 → Fixed SVG file compiled issue,
removed source map for JS
JS will not “uglify”
Include all JS before “Babel” it

0.15.6 → Fixed “includes” issue

0.15.5 → Fixed “build” and “deploy” processes, and added “vendor.js” to the processes.

0.15.4 → Tidy up the overwrite method