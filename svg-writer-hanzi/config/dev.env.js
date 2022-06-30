'use strict'
module.exports = {
  NODE_ENV: '"dev"',
  debug: 'true', // vconsole调试，本地环境不需要可改为false【需重启服务】
  bigData: '"https://test-click.feihua100.com/"', // 哈勃上报地址
  manHaDun: {
    partner_id: 37087513
  },
  cdnPath: '"/"',
  baseURL: '"https://test-maodou.feihua100.com/"',
  // sentry: "true", // 本地环境不开sentry
  // wsUrl: '"ws://172.31.96.177:21666"',
  wsUrl: '"wss://test-api.feihua100.com"',
  // wsUrl: '"ws://127.0.0.1:8282"',
  // sentry: 'true', // 是否需要sentry上报
  payConfig: {
    appId: '"wxe02cd0bed85c4388"', // 毛豆爱古诗
  }
}
