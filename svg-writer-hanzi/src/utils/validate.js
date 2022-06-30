export default {
    isNull(str) {
        // 为空返回true
        return !str.trim().length;
    },
    phoneValidate(str) {
        let reg = /^1[3456789]\d{9}$/;
        if (reg.test(str)) {
            return true;
        }
        return false;
    },
    lenValidate(str, max, min) {
        let len = str.trim().length;
        return len >= min && len <= max;
    },
};
