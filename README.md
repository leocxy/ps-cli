### Brief

Refactored Shopify Slate(0.14.0), so we can still use it on M2 Chip or other latest OS.

# How to test the cli commands

```shell
# at the root folder
>node ./src/index.js

# test the bin with build file
>node ./dist/index.js

# enable debug message
>DEBUG=1 node ./src/index.js
```

# Change Logs
0.16.7 -> `live` will not consider as a valid `theme_id` anymore. (config.yml)

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

# Known issues
1. Not fully test yet