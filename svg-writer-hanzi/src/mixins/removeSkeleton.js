export default {
    mounted() {
        const rootSkeleton = document.getElementById('rootSkeleton');
        rootSkeleton && document.body.removeChild(rootSkeleton);
    }
};
