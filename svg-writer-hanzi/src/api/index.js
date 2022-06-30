/**
 * mweb  api
 */
let BASE_URL = '';
console.log('NODE_ENV', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'dev') {
    BASE_URL = '/dev';
}

export default {
    // 分享学习报告页面
    studyReportSharePage: `${BASE_URL}/api/feihua/v1/course/shareDetail`,
    // 我的作品分享
    myWorkSharePage: `${BASE_URL}/api/feihua/v1/user/opus/shareDetail`,
    // APP下载版本获取
    appVerDownLoad: `${BASE_URL}/api/feihua/v1/pub/upgradShare`,
    // 写字题汉字数据
    getHanziData2: `${BASE_URL}/api/feihua/v1/pub/getHanziData`,
    getstrokeAudioData: `${BASE_URL}/api/feihua/v1/pub/hanzi/stroke/get`,
    getHanziData: 'https://i.gsxcdn.com/hanzi-writer-data-master/data/',
    weixin: {
        // 获取微信分享的配置信息
        config: `${BASE_URL}/api/feihua/v1/share/sign`
    },
};
