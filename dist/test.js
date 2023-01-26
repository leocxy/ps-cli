import themeKit from '@shopify/themekit';
import { slateConfig, commonConfig } from "./tasks/config.js";
import axios from 'axios';
import { readFileSync } from "fs";
import { load } from "js-yaml";
let file = readFileSync(commonConfig.tkConfig, 'utf-8');
let tkConfig = load(file);
tkConfig = tkConfig['dev'];
const client = axios.create({
  baseURL: `https://${tkConfig.store}/admin/api/unstable`,
  timeout: 5000,
  headers: {
    'X-Shopify-Access-Token': tkConfig.password
  }
});
client.get('/themes.json').then(({
  data
}) => console.log(data));

// console.log(slateConfig, commonConfig.dist.root)
// themeKit.command(
//     'deploy',
//     {env: 'live', ignoredFiles: slateConfig.ignoreFiles, 'allow-live': true},
//     {cwd: commonConfig.dist.root}
// ).then(() => {
//     console.log('success')
// }).catch(err => {
//     console.error(err, 'err')
// })

// themeKit.command(
//     'get',
//     {env: 'dev', 'list': true},
// ).then((res) => {
//     console.log(res, 'here')
// }).catch(err => {
//     console.error(err, 'err')
// })