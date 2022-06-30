<template>
    <div id="app" v-cloak>
        <router-view v-if="isRouterAlive" />
    </div>
</template>

<script>
// import queryString from 'query-string';
import removeSkeleton from '@/mixins/removeSkeleton';

export default {
    name: 'App',
    mixins: [removeSkeleton],
    provide() {
        return {
            reload: this.reload
        };
    },
    data() {
        return {
            isRouterAlive: true
        };
    },
    created() {

    },
    methods: {
        reload() {
            this.isRouterAlive = false;
            this.$nextTick(function () {
                this.isRouterAlive = true;
            });
        }
    }
};
</script>

<style>
#app {
    font-family: PingFangSC-Medium, serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    /* text-align: center; */
    color: #2c3e50;
    height: 100%;
}

html,
body {
    height: 100%;
    text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    touch-action: manipulation;
}

body {
    margin: 0;
}

li {
    list-style-type: none;
}

em {
    font-style: normal;
}

.mint-indicator-wrapper {
    font-size: 16px !important;
}
</style>
