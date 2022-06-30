// 错误上报
import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import utils from '@/utils/utils';

if (process.env.sentry) {
    const typeMap = {
        live: '直播',
        playback: '回放'
    };
    const playType = typeMap[utils.getUrlKey('type')] || '未知';
    const quizItemId = utils.getUrlKey('quizItemId');
    const roomNumber = utils.getUrlKey('roomNumber');

    Raven.config(
        'https://d4ed105b6dfc4b288156b772d3c5cac9@sentry.baijiahulian.com/98',
        {
            // 网址不做截断
            maxUrlLength: 0,
            ignoreErrors: [
                '您已经领取红包了',
                '红包已结束',
                '小测题目已提交过了',
                'Error: Network Error',
                'Error: timeout of 5000ms exceeded',
                'Error: Request failed with status code',
                'Object has no method'
            ],
            extra: {
                reportTime: new Date().toString(),
                url: location.href
            },
            tags: {
                playType,
                errortags: 'pgerrors',
                router: location.hash.split('?')[0].substring(1),
                quizItemId,
                roomNumber
            }
        }
    )
        .addPlugin(RavenVue, Vue)
        .install();
}

/**
 *
 * @param { string } msg  上报title
 * @param { boj } extra 需要上报定位的参数
 */
// eslint-disable-next-line import/prefer-default-export
// export function sentryReport(...args) {
//     const msg = args[0];
//     const others = args[1];
//     const options = {extra: others};
//     if (others && others.tags) {
//         options.tags = others.tags;
//         others.tags = void 0;
//     }
//     Raven.captureMessage(msg, options);
// }
