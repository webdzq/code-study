// @Descripttion: 屏幕适配
// @Author: huoge
// @Date: 2019-07-13 11:37:54
// 适应屏幕：横屏、竖屏（horizon，vertical）
const ONE_WAN = 10000;
const ONE_BAI = 100;
const ONE_BAI_BA = 180;
const ONE_ZERO_BA_ZERO = 1080;
function adaptiveScreen(type = 'horizon') {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const $wrapper = document.querySelector('body');
    let style = '';
    if (type === 'vertical') {
        style += `width:${height}px;`;
        style += `height:${width}px;`;
        style += '-webkit-transform: rotate(90deg); transform: rotate(90deg);';
        // 注意旋转中点的处理
        style += `-webkit-transform-origin: ${width / 2}px ${width / 2}px;`;
        style += `transform-origin: ${width / 2}px ${width / 2}px;`;
        // style += `width:${width}px;`;
        // style += `height:${height}px;`;
        // style += 'top:0px;';
        // style += 'left:0px;';
        // style += 'transform:none;';
        // style += 'transform-origin:50% 50%;';
    }
    else {
        style = '';
        // style += `width:${height}px;`;
        // style += `height:${width}px;`;
        // style += `top:${(height - width) / 2}px;`;
        // style += `top:${0 - (height - width) / 2}px;`;
        // style += 'transform:rotate(90deg);';
        // style += 'transform-origin:50% 50%;';
    }
    $wrapper.style.cssText = style;
}
// 判断设备的旋转方向
function judgeDeviceRotation(callback) {
    let type = '';
    let size = '';
    // 竖屏
    if ((window.orientation === 0 || window.orientation === ONE_BAI_BA) && innerHeight > innerWidth) {
        type = 'vertical';
        size = ~~(document.documentElement.clientWidth * (ONE_BAI / ONE_ZERO_BA_ZERO) * ONE_WAN) / ONE_WAN;
        document.documentElement.style.fontSize = `${size}px`;
    }
    else {
        type = 'horizon';
        size = ~~(document.documentElement.clientHeight * (ONE_BAI / ONE_ZERO_BA_ZERO) * ONE_WAN) / ONE_WAN;
        document.documentElement.style.fontSize = `${size}px`;
    }
    setTimeout(() => {
        const newSize
            = ~~(+window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize.replace('px', '') * 10000)
            / ONE_WAN;
        // console.log('()()(()() newSize, size, type', newSize, size, type);
        if (newSize !== size) {
            document.documentElement.style.fontSize = `${size * (size / newSize)}px !important`;
        }
        adaptiveScreen(type);
        callback && callback(type);
    }, 0);
}
export default callback => {
    // 添加屏幕大小改变的事件监听
    if (process.browser) {
        // 判断是否是手机端
        const ua = navigator.userAgent;
        const isMobile = ua.includes('Mobile');
        if (isMobile) {
            // 移动设备增加监听事件，根据屏幕的旋转再重新渲染背景
            window.onorientationchange = () => {
                judgeDeviceRotation(callback);
            };
        }
        judgeDeviceRotation(callback);
        window.onresize = () => {
            judgeDeviceRotation(callback);
        };
    }
};
