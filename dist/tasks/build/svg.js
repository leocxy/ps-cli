import plumber from 'gulp-plumber';
import size from 'gulp-size';
import extReplace from 'gulp-ext-replace';
import { eventInstance, deleteFiles, watch, src, dest } from "../helper.js";
import { slateConfig, commonConfig } from '../config.js';
import { logger } from "../../utils.js";

/**
 * Processing for SVGs prior to deployment - adds accessibility markup, and converts
 * the file to a liquid snippet.
 *
 * @param {String|Array} files - glob/array of files to match & send to the stream
 * @returns {Stream}
 * @private
 */
const processIcons = files => {
  // Check Overwrite function
  let fn = slateConfig.fn?.processIcons || null;
  if (typeof fn === 'function') {
    return fn({
      ...slateConfig,
      ...commonConfig
    }, logger, files);
  }
  logger.processFiles('build:svg');
  return src(files).pipe(plumber(logger.plumberErrorHandle)).pipe(extReplace('.liquid')).pipe(size({
    showFiles: true,
    pretty: true
  })).pipe(dest(commonConfig.dist.snippets));
};

/**
 * Cleanup/remove liquid snippets from the `dist` directory during watch tasks if
 * any underlying SVG files in the `src` folder have been removed.
 *
 * @param {Array} files - glob/array of files to match & send to the stream
 * @returns {Stream}
 * @private
 */
const removeIcons = files => {
  logger.processFiles('remove:svg');
  files = files.map(file => file.replace('src/icons', 'dist/snippets').replace('.svg', '.liquid'));
  // check files ?
  return deleteFiles(files);
};
export default {
  'build:svg': () => {
    logger.processFiles('build:svg');
    return processIcons(slateConfig.src.icons);
  },
  'watch:svg': () => {
    watch(slateConfig.src.icons, {
      ignoreInitial: true,
      delay: 500
    }).on('all', (event, path) => {
      logger.fileEvent(event, path);
      eventInstance.addEvent(event, path);
      eventInstance.processEvent(processIcons, removeIcons);
    });
  }
};