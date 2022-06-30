// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import {Button, Toast, Popup} from 'mint-ui';
// import wx from 'weixin-js-sdk';
import App from './App';
import router from './router';
// // 哈勃
// 友盟埋点
import './utils/umeng.config';
// 挂到原型上的属性
import './utils/Vue.prototype.config';
// 其他杂七杂八放到这里
import './utils/base.config';
// 自定义指令
import './directives';
// 自定义过滤器
import './filters';

// console.log('wx=', wx);
Vue.config.productionTip = true;
Vue.component(Button.name, Button);
Vue.component(Toast.name, Toast);
Vue.component(Popup.name, Popup);
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {
        App
    },
    template: '<App/>'
});
