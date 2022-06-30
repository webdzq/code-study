
import utils from './utils';

/** *** 样式 *****/
import 'mint-ui/lib/toast/style';
import 'mint-ui/lib/indicator/style';

//  生成track_id
// utils.setTrackId();

if (utils.isPC()) {
    const style = document.createElement('style');
    style.innerText = '#__vconsole{display:none!important}';
    document.head.appendChild(style);
}

// eslint-disable-next-line no-extend-native
Array.prototype.last = Array.prototype.last || function last(endIndex = 0) {
    return this[this.length - endIndex - 1];
};
