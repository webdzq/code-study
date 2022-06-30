import Vue from 'vue';
import Router from 'vue-router';

import {toast} from 'mint-ui';
import utils from '@/utils/utils';

Vue.use(Router);
// export default new Router({
const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import(/* webpackChunkName: "index" */'@/views/index'),
            beforeEnter(to, from, next) {
                document.getElementsByTagName('html')[0].style.fontSize = 'unset';
                if (to.redirectedFrom) {
                    toast(`不存在此路由: ${to.redirectedFrom}`);
                }
                next();
            }
        },
        {
            path: '/qz',
            name: 'writerQuiz',
            component: () => import(/* webpackChunkName: "test" */'@/views/writerQuiz')
        },
        {
            path: '*',
            name: '404',
            redirect: '/'
        }
    ]
});
router.beforeEach((to, from, next) => {
    if (/from=[^&$?]{1,}(&|$)/.test(location.search) || /isappinstalled=[^&$?]{1,}(&|$)/.test(location.search)) {
        const newSearch = location.search.replace(/from=[^&$?]{1,}(&|$)/, '').replace(/isappinstalled=[^&$?]{1,}(&|$)/, '')
            .replace(/&$|\?$/, '');
        const newUrl = location.origin + location.pathname + newSearch + location.hash;
        window.location.replace(newUrl);
    }
    else {
        const reg = /(authorization|productDetails|orderList|paid)/;
        if (reg.test(to.name)) {
            if (!utils.isWXBrower()) {
                next({name: 'wxTips'});
            } else {
                next();
            }
        } else {
            next();
        }
    }
});
router.afterEach((to, from) => {
    /* eslint-disable */
    console.log(location.href,to.fullPath,from.fullPath);

    /* eslint-enable */
});
export default router;
