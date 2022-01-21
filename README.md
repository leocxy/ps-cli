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

# Known issues
1. The overwrite function might be wrong.
2. Not fully test yet