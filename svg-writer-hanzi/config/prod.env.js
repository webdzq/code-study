'use strict'
const merge = require('webpack-merge')
const testEnv = require('./test.env')

module.exports = merge(testEnv, {
  beta: {
    NODE_ENV: '"beta"',
    bigData: '"https://test-click.feihua100.com/"',
    manHaDun: {
      partner_id: 49752473
    },
    cdnPath: '"./"',
    baseURL: '"https://beta-maodou.feihua100.com"',
    wsUrl: '"wss://beta-api.feihua100.com"',
  },
  beta2: {
    NODE_ENV: '"beta2"',
    bigData: '"https://test-click.feihua100.com/"',
    sentry: 'true', // 是否需要sentry上报
    manHaDun: {
      partner_id: 49752473
    },
    cdnPath: '"./"',
    baseURL: '"https://beta2-maodou.feihua100.com"',
    wsUrl: '"wss://beta2-api.feihua100.com"',
  },
  prod: {
    NODE_ENV: '"production"',
    bigData: '"https://click.feihua100.com/"',
    sentry: 'true', // 是否需要sentry上报
    manHaDun: {
      partner_id: 49752473     
    },
    // cdnPath: '"//interactive-cdn.feihua100.com/z_student/"',
    // cdnPath: '"./"',
    cdnPath: '"https://fhm.gsxcdn.com/"',
    baseURL: '"https://maodou.feihua100.com"',
    wsUrl: '"wss://api.feihua100.com"',
    payConfig: {
      appId: '"wxe02cd0bed85c4388"', // 毛豆爱古诗
    }
  }
})
