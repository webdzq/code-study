import Vue from 'vue';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import WX from 'weixin-js-sdk';
import Video from 'video.js';
/* eslint-disable */
import 'video.js/dist/video-js.css';
import Api from '../api';
import Http from './http';
import utils from './utils';

// import {sentryReport} from './sentry.config';
Vue.prototype.$utils = utils;
Vue.prototype.$axios = axios;
Vue.prototype.$http = Http;
Vue.prototype.$Api = Api;
Vue.prototype.$wx = WX;

Vue.prototype.$video = Video;


// url上的所有参数
Vue.prototype.$urlParams = utils.getUrlKey();
// client判断
const client = utils.getUrlKey('client');
Vue.prototype.$isAndroid = client === 'android';
Vue.prototype.$isIOS = client === 'ios';
Vue.prototype.$isPC = client === 'pc';
// Vue.prototype.$sentryReport = sentryReport;
Vue.prototype.$cloneDeep = cloneDeep;

Vue.prototype.LETTER_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 微信分享
 * @param {title, desc, link, imgUrl} payload 分享自定义数据
 */

Vue.prototype.$wxShare = (payload = {}, callback) => {
    const ua = window.navigator.userAgent.toLowerCase();
    console.log(ua.match(/MicroMessenger/i) === 'micromessenger')
    if ((/MicroMessenger/i).test(ua)) {
        //url: location.origin + this.$route.fullPath
        console.log('Vue.=',payload.link);
        const params = {
            url: payload.link || location.origin 
        };
        console.log('params=',params);
        axios.get(Api.weixin.config, {params}).then(res => {
            if (res && res.code === "0") {
                const data = res.data;
                // console.log('data=',data);
                if (data) {
                    const jsApiList = ['checkJsApi','updateAppMessageShareData', 'updateTimelineShareData'];
                    const params = {
                        debug: false,
                        appId: data.appId,
                        timestamp: data.timestamp,
                        nonceStr: data.noncestr,
                        signature: data.signature,
                        jsApiList
                    };
                    const shareData = {
                        title: payload.title || '毛豆爱古诗',
                        desc: payload.desc || '毛豆爱古诗!',
                        link: data.url || location.origin,
                        imgUrl: payload.imgUrl || 'https://p.gsxcdn.com//60828014_490y19dj.png',
                        success: function() {
                            console.log('分享成功');
                        }
                    };
                    console.log('shareData=',shareData);
                    WX.config(params);
                    WX.ready(() => {
                        WX.updateTimelineShareData(shareData);
                        WX.updateAppMessageShareData(shareData);
                    });
                    WX.error(function(res){
                        console.log('res=',res);
                      });
                    // eslint-disable-next-line callback-return
                    callback && callback();
                }
            }
        });
    }
};
