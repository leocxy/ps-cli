import { spawn } from "cross-spawn";
import Debug from 'debug';
import { config } from '../utils.js';
const debug = Debug('1');
export default function (cli) {
  cli.command('theme').alias('t').description('Get themes information from Shopify').option('-e, --env <environment>', 'Shopify store to deploy code to (specified in config.yml - default: development)', 'development').action((options = {}) => {
    debug(`--gulpfile ${config.gulpFile}`);
    debug(`--cwd ${config.themeRoot}`);
    debug(options);
    spawn(config.gulp, ['theme-list', '--gulpfile', config.gulpFile, '--cwd', config.themeRoot, '--env', options.env], {
      stdio: 'inherit'
    });
  });
}