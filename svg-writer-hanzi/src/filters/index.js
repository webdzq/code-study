import Vue from 'vue';

const filters = {
    secToTime: function secToTime(s) {
        let t;
        if (s > -1) {
            const hour = Math.floor(s / 3600);
            const min = Math.floor(s / 60) % 60;
            const sec = s % 60;
            if (hour < 1) {
                t = '';
            }
            else if (hour < 10) {
                t = `0${hour}:`;
            }
            else {
                t = `${hour}:`;
            }

            if (min < 10) {
                t += '0';
            }
            t += `${min}:`;
            if (sec < 10) {
                t += '0';
            }
            t += sec;
        }
        return t;
    },
    coinClassFilter: function coinClassFilter(val) {
    // 不四舍五入
        let res = 0;
        // 将执行概率大的放前面
        if (val > 0 && val < 10) {
            res = val.toFixed(3).slice(0, -1);
        }
        else if (val >= 10 && val < 100) {
            res = val.toFixed(2).slice(0, -1);
        }
        else if (val >= 100 && val <= 9999) {
            res = Math.floor(val);
        }
        else if (val > 9999) {
            res = '9999+';
        }
        return res;
    }
};
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
});
