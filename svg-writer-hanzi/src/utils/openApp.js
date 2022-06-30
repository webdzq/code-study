
/**
 * @file openOrDonwloadApp
 * h5下如何走，微信下如何走
 *
 */

// 官方下载地址
const officialDownloadLink = 'https://test-maodou.feihua100.com/dwda';
const officialDownloadLinkAndroid = 'https://test-maodou.feihua100.com/dwda';
// 唤起app，唤起失败就下载，url为schema url，app端提供。isTryDownload：打开失败是否跳转下载
const preventDefaul  = e => {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    else {
        e.returnValue = false;
    }
};

const openOrDonwloadApp = (url, res, isTryDownload = true) => {
    let isAndroid;
    let isIOS;
    let isIOS9;
    let version;
    let ipad;
    const u = navigator.userAgent;
    const ua = u.toLowerCase();
    const TIMEOUT = 3000;
    // let openScript;
    let timeoutId;
    // android终端或者uc浏览器
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
        // Android系统
        isAndroid = true;
    }
    if (u.indexOf('Macintosh' > -1)) {
        ipad = true;
    }
    if (ua.indexOf('like mac os x') > 0) {
        // ios
        const regStrSaf = /os [\d._]*/gi;
        const verinfo = ua.match(regStrSaf);
        version = (`${verinfo}`).replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.');
    }
    const versionStr = `${version}`;
    if (versionStr !== 'undefined' && versionStr.length > 0) {
        // eslint-disable-next-line radix
        version = parseInt(version);
        if (version >= 8) {
            // ios9以上
            isIOS9 = true;
        }
        else {
            isIOS = true;
        }
    }
    preventDefaul();
    if (ipad) {
        console.log('isipad', url);
        window.location.href = url;
    }
    // 安卓和ios8及之前
    if (isAndroid || isIOS) {
        const t = 1000;
        let hasApp = true;
        const t1 = Date.now();
        const ifr = document.createElement('iframe');
        console.log('ua,uc=', /UCBrowser/g.test(u));
        if (/UCBrowser/g.test(u)) {
            window.location.assign(url);
        }
        else {
            window.location.href = url;
        }
        ifr.setAttribute('src', url);
        ifr.setAttribute('style', 'display:none');
        document.body.appendChild(ifr);
        const openScript = setTimeout(() => {
            if (!hasApp && isTryDownload) {
                // 安卓提供的下载链接
                if (isAndroid) {
                    window.location.href = res.androidDownloadUrl || officialDownloadLinkAndroid;
                }
                // app store
                else {
                    window.location.href = res.iosJumpUrl || officialDownloadLink;
                }
            }
            document.body.removeChild(ifr);
        }, TIMEOUT);

        timeoutId = setTimeout(() => {
            const t2 = Date.now();
            if (t2 - t1 < t + 100) {
                hasApp = false;
            }
        }, t);
        window.onblur = () => {
            window.clearTimeout(timeoutId);
            window.clearTimeout(openScript);
        };
    }
    // ios9及之后
    if (isIOS9) {
        console.log('isIOS9', url);
        window.location.href = url;
        // app store
        const openScript = setTimeout(() => {
            // 未唤醒客户端
            const hidden = document.hidden || document.webkitHidden;
            if (!hidden && isTryDownload) {
                window.location.href = res.iosJumpUrl || officialDownloadLink;
            }
        }, TIMEOUT);
        window.onblur = () => {
            window.clearTimeout(openScript);
        };
    }
};

export default openOrDonwloadApp;
