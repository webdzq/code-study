/* eslint-disable babel/new-cap */
import axios from 'axios';
import qs from 'qs';
import {toast, Indicator} from 'mint-ui';
import api from '../api';
// import {sentryReport} from './sentry.config';
import utils from './utils';

// const {gaotuToken = ''} = utils.getUrlKey();
console.log(utils.getUrlKey(), '获取iframe链接参数');

// 接口鉴权(通过roomNumber、subRoomNumber、gaotuToken后端做校验)
// Object.assign(axios.defaults.headers, {
//     gaotuToken,
//     iframeUrl: location.href
// });

// 环境隔离
process.env.gt_env && (axios.defaults.headers.TestEnvVersion = process.env.gt_env);

// 超时
axios.defaults.timeout = 5000;
axios.defaults.baseURL = process.env.NODE_ENV === 'dev' ? '' : process.env.baseURL;

const isInsider = document.referrer.includes('from=access');
// const $sentryReport = isInsider ? $ => $ : sentryReport;
let toastObj = null;

// 不展示loading的接口列表
const hideLoadingApiList = [];

// 不展示错误提示的接口列表
const hideToastApiList = [];

// 请求拦截
axios.interceptors.request.use(
    config => {
        // console.log('request请求：', config);

        // 是否隐藏loading
        const hideLoading = hideLoadingApiList.some(item => config.url.includes(api[item]));
        if (!hideLoading) {
            // 展示loading
            Indicator.open();
        }

        config.isHideToast = hideToastApiList.some(item => config.url.includes(api[item]));

        return config;
    }, error => {
        toast('请求错误');
        // 请求错误上报
        // $sentryReport('接口请求错误', {
        //     api: error.config.url,
        //     paramData: error.config.data,
        //     tags: {
        //         // 不成功请求
        //         errortags: 'failrqts'
        //     }
        // });

        return Promise.reject(error);
    }
);

// 响应拦截
axios.interceptors.response.use(response => {
    // console.log('response响应：', response);

    // 关闭loading
    setTimeout(() => Indicator.close());

    let errMsg = '';
    // 如果是用code标识
    // if (Object.prototype.hasOwnProperty.call(response.data, 'code')) {
    //     errMsg = response.data.msg;
    //     response.config.isHideToast = response.data.code === 277;
    // }

    // 如果是用status标识
    if (Object.prototype.hasOwnProperty.call(response.data, 'status')) {
        errMsg = response.data.error_info || response.data.errorInfo;
    }

    if (errMsg) {
        if (!response.config.isHideToast) {
            // 不为空先关闭再弹框,if内置保证错误信息和状态码不为277才先关闭再弹框
            if (toastObj) {
                toastObj.close();
            }
            toastObj = toast(errMsg);
        }
        // !response.config.isHideToast && Toast(errMsg);
        // 返回错误上报
        // $sentryReport(`接口data错误: ${errMsg}`, {
        //     api: response.config.url,
        //     paramData: response.config.data,
        //     responseData: response.data,
        //     tags: {
        //         // 不成功请求
        //         errortags: 'errcodes'
        //     }
        // });
    }
    return response.data;
},
error => {
    // 关闭loading
    setTimeout(() => Indicator.close());

    /** ************ 错误提示 start **************/
    const isShowToast = !error.config.isHideToast;
    if (error.message.includes('timeout')) {
        isShowToast && toast('请求超时，请检查您的网络');
        error.response = {
            status: 'timeout'
        };
    }
    else {
        isShowToast && toast(`网络错误 ${error.message}`);
    }

    /** ************ 错误提示 end **************/


    /** ************ 错误上报 start **************/
    const reportData = {
        api: error.config.url,
        paramData: error.config.data,
        tags: {
            // 不成功请求
            errortags: 'failrqts'
        }
    };

    // 默认信息
    let reportMessage = `接口错误: ${error.message}`;

    if (error.message.includes('timeout')) {
        reportMessage = `接口超时: ${error.message}`;
    }

    if (/^5\d{2}$/.test(error.response && error.response.status)) {
        // 500特殊上报
        reportMessage = `接口${error.response.status}: ${error.config.url}`;
        reportData.error = error;
    }

    // $sentryReport(reportMessage, reportData);

    /** ************ 错误上报 end **************/

    // 不做后续处理
    return Promise.reject(error);
});

function post(url, data) {
    return axios({
        method: 'post',
        url,
        data,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'mpweb'
        }
    });
}
function get(url, params) {
    return axios({
        method: 'get',
        url,
        // get 请求时带的参数
        params,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'mpweb'
        }
    });
}
// 老接口用这种形式，默认采用x-www-form-urlencoded传输
function qsPost(url, data) {
    return axios({
        method: 'post',
        url,
        // 将{a: 1, b: 2}转成'a=1&b=2&c=3'
        data: qs.stringify(data),
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'mpweb'
        }
        // transformRequest: data => qs.stringify(data)
    });
}
// 上传接口，使用 new FormData()
function uploadPost(url, data) {
    return axios({
        method: 'post',
        url,
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export default {
    post,
    get,
    qsPost,
    uploadPost,
};
