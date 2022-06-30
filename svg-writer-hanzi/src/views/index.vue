<template>
    <div class="index-counter">
        <div class="index">
            <img src="/static/assets/img/about.jpeg">
        </div>
        <div class="__footer">
            <p class="company-info">

            </p>

        </div>
    </div>
</template>
<script>
// 官网首页
export default {
    data() {
        return {
            routers: []
        };
    },
    created() {
        // this.routers = this.$router.options.routes.filter(item => !['index', 'test', '404'].includes(item.name));
        this.routers = this.$router.options.routes;
    },
    mounted() {

    },
};
</script>
<style lang="less" scoped>
.index {
    img {
        width: 100%;
        display: block;
        margin: 0 auto;
    }
    // width: 23.5rem;
    // height: 51rem;
    // background: url(/static/assets/img/about.jpeg) no-repeat;
    // background-size: 100% 100%;
    // text-align: center;
}
@media screen and (mix-width: 1000px) {
    background-size: center top;
}
.__footer {
    width: 100%;
    color: #fff;
    background: #000;
    font-size: 0.5rem;
    text-align: center;
    display: inline-block;
}
</style>
