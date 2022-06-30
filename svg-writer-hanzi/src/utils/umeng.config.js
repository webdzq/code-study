// 添加埋点统计
const script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://s13.cnzz.com/z_stat.php?id=1279189767&web_id=1279189767';
document.body.appendChild(script);

const script1 = document.createElement('script');
script1.type = 'text/javascript';
script1.innerHTML = `var _czc = _czc || [];
_czc.push(["_setAccount", "1279189767"]);`;
// 统计
document.body.appendChild(script1);

// 不加eslint会报错
export {};

