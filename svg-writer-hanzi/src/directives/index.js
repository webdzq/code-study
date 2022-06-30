import Vue from 'vue';
import utils from '../utils/utils';

const directives = {
    // 点击上报
    clickReport: {
        inserted(el, binding) {
            el.addEventListener('click', () => {
                if (binding.value) {
                    const {track_id, user_id, logger_id} = utils.getInfo();
                    /* eslint-disable */
                    let event_id = '';
                    if (typeof binding.value === 'object') {
                        const path = window.location.hash.substring(1).split('?')[0];
                        event_id = binding.value[path];
                    }
                    else {
                        event_id = binding.value;
                    }

                    /* eslint-enable */
                }
            });
        }
    },
    title: {
        inserted: function (el, binding) {
            document.title = el.dataset.title;
        }
    }
};

Object.keys(directives).forEach(directive => {
    Vue.directive(directive, directives[directive]);
});
