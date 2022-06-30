'use strict'
const gt_env = require('yargs').argv.gt_env || '';
module.exports = {
    test: {
        NODE_ENV: '"test"',
        debug: 'true', // 是否需要vconsole
        bigData: '"https://test-click.feihua100.com/"',
        manHaDun: {
            partner_id: 37087513
        },
        // cdnPath: '"//test-interactive-cdn.feihua100.com/z_student/"',
        cdnPath: '"./"',
        baseURL: '"https://test-maodou.feihua100.com"',
        gt_env : `"${gt_env}"`,
        // sentry: 'true',
        wsUrl: '"wss://test-api.feiha 100.com"',
        payConfig: {
            appId: '"wx874724d8acf3dc9d"', // 飞花坊
            // 毛豆爱古诗:wxe02cd0bed85c4388
        }
    }
}

