import Cookies from 'js-cookie';

export default {

    getOffsetPosition(ele) {
        let left = 0;
        let top = 0;
        while (ele) {
            left += ele.offsetLeft;
            top += ele.offsetTop;
            ele = ele.offsetParent;
        }
        return {left, top};
    },
    // 让金币fly的核心代码，实际上就是通过增加一个transform指定偏移量使金币会有位置偏移，然后通过指定transition指定元素的运动时间和运动速率即可完成运动。
    // 你要输入动画参数以及动画完成的回调函数
    async fly(flyArgs, endCb) {
        // @param fatherDOMArr：父元素的数组，把横向的transform绑定到数组中的所有元素上
        // @param childDOMArr：子元素数组，把纵向的transform绑定到数组中的所有元素上
        // @param translateX：金币动画结束时与开始相比的横向偏移值
        // @param translateY：金币动画结束时与开始相比的纵向偏移值
        const length = flyArgs.fatherDOMArr.length <= 10 ? flyArgs.fatherDOMArr.length : 10;
        // 等待500毫秒，为了动画更加流畅
        await this.wait(500);
        const setTransform =  (flyArgs, idx) => {
            flyArgs.childDOMArr[idx].style.width = `${flyArgs.finalWidth}px`;
            flyArgs.fatherDOMArr[idx].style.transitionProperty = 'transform, opacity, width';
            flyArgs.fatherDOMArr[idx].style.transitionDuration = '.8s, .8s, .8s';
            // eslint-disable-next-line max-len
            flyArgs.fatherDOMArr[idx].style.transitionTimingFunction = 'cubic-bezier(0, 0, 1, 1), ease, cubic-bezier(0, 0, 1, 1)';
            flyArgs.fatherDOMArr[idx].style.transform = `translateX(${flyArgs.translateX}px)`;
            flyArgs.childDOMArr[idx].style.transition = flyArgs.verticalTransition;
            // 向上偏移所以translateY是负值
            flyArgs.childDOMArr[idx].style.transform = `translateY(-${flyArgs.translateY}px)`;
            this.setTimeout(endCb.bind(null, flyArgs, idx, length), 600);
        };
        for (let i = 0; i < length; i++) {
            /* eslint-disable */
            flyArgs.fatherDOMArr[i].style.display = 'block';
            flyArgs.translateX = flyArgs.getTransform().translateX;
            flyArgs.translateY = flyArgs.getTransform().translateY;
            /* eslint-enable */
            this.setTimeout(setTransform.bind(null, flyArgs, i), i * 100);
        }
    },
    // 挂起几秒
    // @param duration: 延时执行的时间，毫秒为单位
    wait(duration) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    },

    // 延时器的同步写法
    setTimeout(cb, duration) {
        setTimeout(() => {
            cb();
        }, duration);
    },
    // 等待图片加载完毕
    imgLoaded(imgDom) {
        return new Promise((resolve, reject) => {
            imgDom.onload = resolve;
            imgDom.onerror = reject;
        });
    },
    isWXBrower() {
        const ua = window.navigator.userAgent.toLowerCase();
        return (/MicroMessenger/i).test(ua);
    },

    /** ****** 判断UA ******/
    isPC() {
        const isAndroid = this.isAndroid();
        const isiOS = this.isIOS();
        return !(isAndroid || isiOS);
    },
    isApp() {
        return !this.isPC();
    },
    isAndroid() {
        const u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
    },
    isIOS() {
        const u = navigator.userAgent;
        // return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        return !!u.match(/\((i|M)[^;]+;( U;)? (CPU|Intel).+Mac OS X/);
    },

    // 与直播pc交互的postMessage
    postMessage(options) {
        const output = {cmd: 2, from: 'gaotu', ...options};
        // const origin = 'http://test-www.feihua100.com/'
        const origin = '*';
        window.parent.postMessage(output, origin);
    },

    /**
     *
     * @param {String} name 参数名。不传则返回包含所有参数的对象
     */
    getUrlKey(name) {
        const map = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, (m, key, value) => {
            map[key] = value;
        });
        if (name) {
            return map[name];
        }

        return map;

    },

    // 关闭iframe
    closeIframe(type) {
        try {
            if (this.isAndroid()) {
                const param = {type: 'closeWin'};
                window.bridge.send(JSON.stringify(param));
            }
            else if (this.isIOS()) {
                window.webkit.messageHandlers.closeWin.postMessage({});
            }
            else {
                this.postMessage({
                    type,
                    data: {}
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    },

    /**
     * 与APP交互的postMessage，通过type判断事件
     *
     * @param {param} object 与APP交互的参数
     *
     */
    sendMessageApp(param) {
        try {
            if (this.isAndroid()) {
                window.bridge.send(JSON.stringify(param));
            }
            else if (this.isIOS()) {
                window.webkit.messageHandlers.operationNotice.postMessage(param);
            }
        }
        catch (error) {
            console.log(error);
        }
    },

    /**
     * toLine对象参数驼峰转下划线，
     *
     *
     * @type { type } string 与APP交互type
     * @param { param } object 与APP交互的参数
     *
     */
    toLine(hump) {
        return hump.replace(/([A-Z]|\d)/g, (a, l) => `_${l.toLowerCase()}`);
    },


    /**
     * sendMessageNative方法与native通信，保持与Android和ios方法名统一为send，
     * native通过type区分，后期统一使用sendMessageNative方法
     *
     * @type { type } string 与APP交互type
     * @param { param } object 与APP交互的参数
     *
     */
    sendMessageNative(type, data) {
        console.log(type, data, '转app上报参数转换前');
        if (data && data.params) {
            const newObj = {};
            // eslint-disable-next-line guard-for-in
            for (const k in data.params) {
                newObj[this.toLine(k)] = data.params[k];
            }
            data.params = newObj;
            console.log(data, '转app上报参数转换后');
            try {
                if (this.isAndroid()) {
                    window.bridge.send(JSON.stringify({
                        type,
                        data,
                    }));
                }
                else if (this.isIOS()) {
                    window.webkit.messageHandlers.send.postMessage({
                        type,
                        data,
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    },

    /**
     * 获取学生上课时手机内存
     *
     */
    getAppMemory() {
        try {
            if (this.isAndroid()) {
                console.log('调用Android获取内存方法');
                return window.bridge.getRamMemoryAvailable();
            }
            if (this.isIOS()) {
                window.webkit.messageHandlers.getRamMemoryAvailable.postMessage({});
            }
        }
        catch (error) {
            console.log(error);
        }
    },

    /**
     * 防抖函数
     * @param method 事件触发的操作
     * @param delay 多少毫秒内连续触发事件，不会执行,默认200毫秒
     * @returns {Function}
     */
    debounce(method, delay = 200) {
        let timer = null;
        return function fn(...rest) {
            const self = this;
            const args = rest;
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                method.apply(self, args);
            }, delay);
        };
    },

    /**
     * 获取字节长度
     *
     * @param {*} s 传入的字符串
     * @returns Number
     */
    getBytesLen(s) {
        let num = 0;
        if (s.length) {
            for (let i = 0; i < s.length; i++) {
                num += ((s.charCodeAt(i) > 255) ? 2 : 1);
            }
        }
        return num;
    },

    /**
     * 按字节截取指定长度字符串（中英混合）
     *
     * @param {*} s 传入的字符串
     * @param {*} len 截取的字节长度(注意：一个字符对应两个字节)
     * @returns 字符串
     */
    reBytesStr(s, len) {
        if ((!s && typeof (s) === 'undefined')) {
            return '';
        }
        let num = 0;
        let newS = '';
        for (let i = 0; i < s.length; i++) {
            // 字符编码大于255，说明是双字节字符
            num += ((s.charCodeAt(i) > 255) ? 2 : 1);
            if (num > len) {
                break;
            }
            else {
                newS = s.substring(0, i + 1);
            }
        }
        return newS;
    },

    // 生成track_id
    setTrackId() {
        /* eslint-disable */
        const track_id = Cookies.get('_gaotu_track_id_') || Cookies.get('__track_id__');
        if (!track_id) {
            const g_uid = function () {
                return [
                    s4() + s4(),
                    s4(),
                    s4(),
                    s4(),
                    s4() + s4() + s4()
                ].join('-');
            };
            const guid = g_uid();
            Cookies.set('_gaotu_track_id_', guid, {
                expires: 1 * 24 * 365 * 100,
                domain: '.feihua100.com' // 在.feihua100.com域名下有效
            });
            Cookies.set('__track_id__', guid, {
                expires: 1 * 24 * 365 * 100,
                domain: '.feihua100.com'
            });
        }
        function s4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        /* eslint-enable */
    },

    // 获取信息，用于埋点上报
    getInfo() {
        /* eslint-disable */
        const track_id = Cookies.get('_gaotu_track_id_') || '';
        const user_id = this.getUrlKey('userNumber') || '';
        const logger_id = Cookies.get('logger_id') || '';
        return {track_id, user_id, logger_id};
        /* eslint-enable */
    },

    // 设置rem
    /**
     *
     * @param {Number} designWidth 设计稿宽度
     */
    setRem(designWidth) {
        let remTimer = 0;
        setRootFontSize();
        window.addEventListener('resize', () => {
            clearTimeout(remTimer);
            remTimer = setTimeout(() => {
                setRootFontSize();
            }, 16);
        });
        function setRootFontSize() {
            document.documentElement.style.fontSize = `${document.documentElement.clientWidth * 100 / designWidth}px`;
        }
    },

    // 题目style对象转成attribute
    jsonToAttr(styleObj = {}) {
        let res = '';
        styleObj.style = (styleObj.style || '').replace(/\s/g, '');
        for (const i in styleObj) {
            res += ` ${i}="${styleObj[i]}"`;
        }
        return res;
    },

    // 通过css-贝塞尔曲线实现抛物线动效方法
    // @param {Object} params 配置参数
    // params {
    // * @param parentBox 父盒子dom节点
    // @param childBox 期望执行抛物线动效的dom节点
    // @param {Number} targetX 目标left值
    // @param {Number} targetY 目标top值
    // @param {Function=} callback 动画执行完毕回调 (可以不传)
    // @param {Number=} timer 多少豪秒后开始执行动画ms (可以不传，默认为500ms)
    // @param {Boolean=} disabledTimer 不使用定时器，直接开始执行动画（可以不传，默认timer后执行动画）
    // @param {Number=} animateTime 动画执行时间s（可以不传，默认为0.8s)
    // dom结构参考下面
    // <div id="parent-box">
    // <div id="child-box">
    // <div class="coinImg"></div>
    // <span>+1</span>
    // </div>
    // </div>
    // }
    parabolicEffect(params) {
        if (!params) {
            return;
        }
        const {
            parentBox,
            childBox,
            targetX,
            targetY,
            callback,
            timer = 500,
            animateTime = 0.8,
            disabledTimer = false
        } = params;
        if (!parentBox || !childBox || (!targetX && targetX !== 0) || (!targetY && targetY !== 0)) {
            return;
        }
        const rect = childBox.getBoundingClientRect() || {};
        const {x, y, width} = rect;
        const translateX = x < targetX ? targetX - x - width / 2 : targetX - x;
        // const translateX = targetX - x;
        const translateY = targetY - y;
        parentBox.style.transition = `all ${animateTime}s cubic-bezier(0, 0, 1, 1)`;
        childBox.style.transition = `all ${animateTime}s cubic-bezier(.85, 0, 1, .52)`;
        const changePosition = () => {
            parentBox.style.transform = `translateX(${translateX}px)`;
            childBox.style.transform = `translateY(${translateY}px)`;
            childBox.style.opacity = 0.05;
            setTimeout(() => {
                childBox.style.opacity = 0;
                callback && callback();
            }, 0);
        };
        disabledTimer ? changePosition() : setTimeout(changePosition, timer);
    },
    getDomPosInfo(dom) {
    // 返回dom对象相对于窗口的位置信息
        if (!dom || (dom && !dom.getBoundingClientRect)) {
            return {};
        }
        // 获取滚动距离，为兼容页面发生滚动情况
        const {pageXOffset = 0, pageYOffset = 0} = window;
        const rectObj = dom.getBoundingClientRect() || {};
        const {left, top, ...posInfo} = (rectObj.toJSON && rectObj.toJSON()) || JSON.parse(JSON.stringify(rectObj));
        return {
            left: left + pageXOffset,
            top: top + pageYOffset,
            ...posInfo
        };
    },
    loadStyle(src) {
        const link = document.createElement('link');
        link.href = src;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(link);
    },
    delWXparams(url) {
        let newUrl = url || location.href;
        if (/from=[^&$?]{1,}(&|$)/.test(location.search) || /isappinstalled=[^&$?]{1,}(&|$)/.test(location.search)) {
            const newSearch = location.search.replace(/from=[^&$?]{1,}(&|$)/, '').replace(/isappinstalled=[^&$?]{1,}(&|$)/, '')
                .replace(/&$|\?$/, '');
            newUrl = location.origin + location.pathname + newSearch + location.hash;
        }
        return newUrl;
    },
    stopDownPush(vdom) {
        // 阻止微信拉下露顶
        // 最后一次y坐标点
        let lastY;
        const dom = vdom || document.body;
        const domBody = document.querySelector(dom);
        const move = function (evt) {
            evt.preventDefault();
        };
        // const move = window.ontouchmove;
        domBody.addEventListener('touchstart', event => {
            // console.log(event);
            // 点击屏幕时记录最后一次Y度坐标。
            lastY = event.changedTouches[0].clientY;
        });
        domBody.addEventListener('touchmove', event => {
            // console.log(event);
            const y = event.changedTouches[0].clientY;
            const st = Math.floor(document.body.scrollTop || document.documentElement.scrollTop || window.pageXOffset);
            // 滚动条高度
            // console.log('st=', st, y >= lastY && st <= 10);
            if (y >= lastY && st <= 20) {
                // 如果滚动条高度小于0，可以理解为到顶了，且是下拉情况下，阻止touchmove事件。
                lastY = y;
                // console.log('isScroller=', isScroller);
                document.body.addEventListener('touchmove', move, {passive: false});
            }
            lastY = y;
        });
        domBody.addEventListener('touchend', event => {
            // console.log('333');
            document.body.removeEventListener('touchmove', move, {passive: false});
        });
    },
    getHiddenProp() {
        // 返回页面hidden值
        const prefixes = ['webkit', 'moz', 'ms', 'o'];
        // 如果hidden 属性是原生支持的，我们就直接返回
        if ('hidden' in document) {
            return 'hidden';
        }
        // 其他的情况就循环现有的浏览器前缀，拼接我们所需要的属性
        for (let i = 0; i < prefixes.length; i++) {
            // 如果当前的拼接的前缀在 document对象中存在 返回即可
            if ((`${prefixes[i]}Hidden`) in document) {
                return `${prefixes[i]}Hidden`;
            }
        }
        // 其他的情况 直接返回null
        return null;
    },
    getVisibilityState() {
        // 返回页面可见性状态
        const prefixes = ['webkit', 'moz', 'ms', 'o'];
        if ('visibilityState' in document) {
            return 'visibilityState';
        }

        for (let i = 0; i < prefixes.length; i++) {
            if ((`${prefixes[i]}VisibilityState`) in document) {
                return `${prefixes[i]}VisibilityState`;
            }
        }
        // 找不到返回 null
        return null;

    },
    clearAnimateionFam(id) {
        const cancelAnimationF = window.cancelAnimationFrame
            || window.webkitCancelRequestAnimationFrame
            || window.mozCancelRequestAnimationFrame
            || window.oCancelRequestAnimationFrame
            || window.msCancelRequestAnimationFrame
            || window.clearTimeout;
        cancelAnimationF(id);
    },
    intervalTimer(cbk, interval) {
        console.log('intervalTimer----', interval);
        let id = 0;
        let time = 0;
        const requestAnimationFr =  cbk => {
            console.log('requestAnimationFrame');
            const frame = ((/* function */ callback, /* DOMElement */ element) => {
                window.setTimeout(cbk, 1000 / 60);
            })();
            const fn = window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || frame;
            fn(cbk);
        };
        function intervalTim2() {
            const currTime = new Date().getTime();
            // let  time = new Date().getTime();
            console.log('intervalTime...', currTime - time > interval, interval);
            if (currTime - time > interval || time === 0) {
                cbk && cbk();
                time = new Date().getTime();
                console.log('intervalTime...time=', time);
                // if (time > 0) {
                //     cancelAnimationF(id);
                // }
            }
            // 返回值是一个long整数,请求ID,是回调列表中唯一的标识，你可以传这个值给window.cancelAnimationFrame()以取消回调函数
            id = requestAnimationFr(intervalTim2);
        }
        intervalTim2();
        // 返回值是一个long整数,请求ID,是回调列表中唯一的标识，你可以传这个值给window.cancelAnimationFrame()以取消回调函数
        return id;
    },
    sleep(delay) {
        const start = (new Date()).getTime();
        let i = 0;
        while ((new Date()).getTime() - start < delay) {
            i++;
        }
        console.log(i);
    },
    initOnSizeLinster(cbk, time) {
        // 屏幕尺寸变化监听
        window.onresize = () => {
            // 横竖屏，尺寸变化时刷新
            const target = this;
            const initTime = new Date().getTime();
            const tim = time || 1000;
            if (target.resizeFlag) {
                // window.clearTimeout(target.resizeFlag);

            }
            console.log('initOnSizeLinster..start.');
            // target.resizeFlag = window.setTimeout(() => {
            //     target.resizeFlag = null;
            //     console.log('initOnSizeLinster..end.');
            //     window.location.reload();
            // }, 5000);
            const brushLoop = function () {
                const curTime = new Date().getTime();
                console.log('initTime - curTime', curTime - initTime);
                if (curTime - initTime  < tim) {

                    window.requestAnimationFrame(brushLoop);
                }
                else {
                    console.log('initOnSizeLinster..end.');
                    window.location.reload();
                }
            };
            brushLoop();
            cbk && cbk();
        };
    },
    quizHanziFormat(strf) {
        return /^[\u4e00-\u9fa5]+$/i.test(strf);
    },
    printDeviceVal(dom) {
        const w = document.body.clientWidth;
        const h = document.body.clientHeight;
        const sh = window.screen.height;
        const sw = window.screen.width;
        const saw = window.screen.availWidth;
        const sah = window.screen.availHeight;
        const dsh =  document.body.scrollHeight;
        const dsw =  document.body.scrollWidth;
        const dpi = window.devicePixelRatio;
        document.querySelector(dom).innerHTML = `调试：${w},${h},${dsh},${dsw},${sw},${sh},${dpi},${saw},${sah}`;
        console.log(`调试：${w},${h},${dsh},${dsw},${sw},${sh},${dpi},${saw},${sah}`);
    }
};
