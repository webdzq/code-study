# axios 源码解读

## 术语

## 常用函数

## 构造函数及实例探秘

- axios和Axios的关系

```js
//构造函数
function Axios(config){
    //初始化
    this.defaults = config;//为了创建 default 默认属性
    this.intercepters = {// 拦截器
        request: {},
        response: {}
    }
}
//原型添加相关的方法
Axios.prototype.request = function(config){
    console.log('发送 AJAX 请求 请求的类型为 '+ config.method);
}
Axios.prototype.get = function(config){
    return this.request({method: 'GET'});
}
Axios.prototype.post = function(config){
    return this.request({method: 'POST'});
}

//声明函数
function createInstance(config){
    //实例化一个对象
    let context = new Axios(config);// context.get()  context.post()  但是不能当做函数使用 context() X
    //创建请求函数
    let instance = Axios.prototype.request.bind(context);// instance 是一个函数 并且可以 instance({})  此时 instance 不能 instance.get X
    //将 Axios.prototype 对象中的方法添加到instance函数对象中
    Object.keys(Axios.prototype).forEach(key => {
        instance[key] = Axios.prototype[key].bind(context);// this.default  this.interceptors
    });
    //为 instance 函数对象添加属性 default 与 interceptors
    Object.keys(context).forEach(key => {
        instance[key] = context[key];
    });
    return instance;
}

let axios = createInstance();// 创建axios,实际是Axios.prototype.request的bind(context)之后产生的
//发送请求
// axios({method:'POST'});
axios.get({});
axios.post({});
```

## `request`函数实现

```js
// axios 发送请求   axios  Axios.prototype.request  bind
//1. 声明构造函数
function Axios(config){
    this.config = config;
}
Axios.prototype.request = function(config){
    //发送请求
    //创建一个 promise 对象
    let promise = Promise.resolve(config);
    //声明一个数组
    let chains = [dispatchRequest, undefined];// undefined 占位
    //调用 then 方法指定回调
    let result = promise.then(chains[0], chains[1]);
    //返回 promise 的结果
    return result;
}

//2. dispatchRequest 函数
function dispatchRequest(config){
    //调用适配器发送请求
    return xhrAdapter(config).then(response => {
        //响应的结果进行转换处理
        //....
        return response;
    }, error => {
        throw error;
    });
}

//3. adapter 适配器
function xhrAdapter(config){
    console.log('xhrAdapter 函数执行');
    return new Promise((resolve, reject) => {
        //发送 AJAX 请求
        let xhr = new XMLHttpRequest();
        //初始化
        xhr.open(config.method, config.url);
        //发送
        xhr.send();
        //绑定事件
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                //判断成功的条件
                if(xhr.status >= 200 && xhr.status < 300){
                    //成功的状态
                    resolve({
                        //配置对象
                        config: config,
                        //响应体
                        data: xhr.response,
                        //响应头
                        headers: xhr.getAllResponseHeaders(), //字符串  parseHeaders
                        // xhr 请求对象
                        request: xhr,
                        //响应状态码
                        status: xhr.status,
                        //响应状态字符串
                        statusText: xhr.statusText
                    });
                }else{
                    //失败的状态
                    reject(new Error('请求失败 失败的状态码为' + xhr.status));
                }
            }
        }
    });
}


//4. 创建 axios 函数
let axios = Axios.prototype.request.bind(null);
axios({
    method:'GET',
    url:'http://localhost:3005/posts'
}).then(response => {
    console.log(response);
});
```

## 拦截器实现

```js
//构造函数
function Axios(config){
    this.config = config;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
    }
}
//发送请求  难点与重点
Axios.prototype.request = function(config){
    //创建一个 promise 对象
    let promise = Promise.resolve(config);
    //创建一个数组
    const chains = [dispatchRequest, undefined];
    //处理拦截器
    //请求拦截器 将请求拦截器的回调 压入到 chains 的前面  request.handles = []
    this.interceptors.request.handlers.forEach(item => {
        chains.unshift(item.fulfilled, item.rejected);
    });
    //响应拦截器
    this.interceptors.response.handlers.forEach(item => {
        chains.push(item.fulfilled, item.rejected);
    });

    // console.log(chains);
    //遍历
    while(chains.length > 0){
        promise = promise.then(chains.shift(), chains.shift());
    }

    return promise;
}

//发送请求
function dispatchRequest(config){
    //返回一个promise 队形
    return new Promise((resolve, reject) => {
        resolve({
            status: 200,
            statusText: 'OK'
        });
    });
}

//创建实例
let context = new Axios({});
//创建axios函数
let axios = Axios.prototype.request.bind(context);
//将 context 属性 config interceptors 添加至 axios 函数对象身上
Object.keys(context).forEach(key => {
    axios[key] = context[key];
});

//拦截器管理器构造函数
function InterceptorManager(){
    this.handlers = [];//这是一个数组
}
InterceptorManager.prototype.use = function(fulfilled, rejected){
    this.handlers.push({
        fulfilled,
        rejected
    })
}


//以下为功能测试代码
// 设置请求拦截器  config 配置对象
axios.interceptors.request.use(function one(config) {
    console.log('请求拦截器 成功 - 1号');
    return config;
}, function one(error) {
    console.log('请求拦截器 失败 - 1号');
    return Promise.reject(error);
});

axios.interceptors.request.use(function two(config) {
    console.log('请求拦截器 成功 - 2号');
    return config;
}, function two(error) {
    console.log('请求拦截器 失败 - 2号');
    return Promise.reject(error);
});

// 设置响应拦截器
axios.interceptors.response.use(function (response) {
    console.log('响应拦截器 成功 1号');
    return response;
}, function (error) {
    console.log('响应拦截器 失败 1号')
    return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    console.log('响应拦截器 成功 2号')
    return response;
}, function (error) {
    console.log('响应拦截器 失败 2号')
    return Promise.reject(error);
});


//发送请求
axios({
    method: 'GET',
    url: 'http://localhost:3005/posts'
}).then(response => {
    console.log(response);
});
```

## 请求取消的实现

```js
//构造函数
function Axios(config){
    this.config = config;
}
//原型 request 方法
Axios.prototype.request = function(config){
    return dispatchRequest(config);
}
//dispatchRequest 函数
function dispatchRequest(config){
    return xhrAdapter(config);
}
//xhrAdapter
function xhrAdapter(config){
    //发送 AJAX 请求
    return new Promise((resolve, reject) => {
        //实例化对象
        const xhr = new XMLHttpRequest();
        //初始化
        xhr.open(config.method, config.url);
        //发送
        xhr.send();
        //处理结果
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                //判断结果
                if(xhr.status >= 200 && xhr.status < 300){
                    //设置为成功的状态
                    resolve({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }else{
                    reject(new Error('请求失败'));
                }
            }
        }
        //关于取消请求的处理
        if(config.cancelToken){
            //对 cancelToken 对象身上的 promise 对象指定成功的回调
            config.cancelToken.promise.then(value => {
                xhr.abort();
                //将整体结果设置为失败
                reject(new Error('请求已经被取消'))
            });
        }
    })
}

//创建 axios 函数
const context = new Axios({});
const axios = Axios.prototype.request.bind(context);

//CancelToken 构造函数
function CancelToken(executor){
    //声明一个变量
    var resolvePromise;
    //为实例对象添加属性
    this.promise = new Promise((resolve) => {
        //将 resolve 赋值给 resolvePromise
        resolvePromise = resolve
    });
    //调用 executor 函数
    executor(function(){
        //执行 resolvePromise 函数
        resolvePromise();
    });
}

//获取按钮 以上为模拟实现的代码
const btns = document.querySelectorAll('button');
//2.声明全局变量
let cancel = null;
//发送请求
btns[0].onclick = function(){
    //检测上一次的请求是否已经完成
    if(cancel !== null){
        //取消上一次的请求
        cancel();
    }

    //创建 cancelToken 的值
    let cancelToken = new CancelToken(function(c){
        cancel = c;
    });

    axios({
        method: 'GET',
        url: 'http://localhost:3005/posts',
        //1. 添加配置对象的属性
        cancelToken: cancelToken
    }).then(response => {
        console.log(response);
        //将 cancel 的值初始化
        cancel = null;
    })
}

//绑定第二个事件取消请求
btns[1].onclick = function(){
    cancel();
}
```

## 部分源码查看

- 来自`axios/lib/axios.js`

```js
'use strict';
// axios 入口文件
//引入工具
var utils = require('./utils');
//引入绑定函数  创建函数
var bind = require('./helpers/bind');// 创建函数的
//引入 Axios 主文件
var Axios = require('./core/Axios');
// 引入合并配置的函数
var mergeConfig = require('./core/mergeConfig');
// 导入默认配置
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 * 创建一个 Axios 的实例对象
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
    //创建一个实例对象 context 可以调用 get  post put delete request
    var context = new Axios(defaultConfig);// context 不能当函数使用  
    // 将 request 方法的 this 指向 context 并返回新函数  instance 可以用作函数使用, 且返回的是一个 promise 对象
    var instance = bind(Axios.prototype.request, context);// instance 与 Axios.prototype.request 代码一致
    // instance({method:'get'});  instance.get() .post()
    // Copy axios.prototype to instance
    // 将 Axios.prototype 和实例对象的方法都添加到 instance 函数身上
    utils.extend(instance, Axios.prototype, context);// instance.get instance.post ...
    // instance()  instance.get()
    // 将实例对象的方法和属性扩展到 instance 函数身上
    utils.extend(instance, context);

    return instance;
}
// axios.interceptors

// Create the default instance to be exported
// 通过配置创建 axios 函数
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
// axios 添加 Axios 属性, 属性值为构造函数对象  axios.CancelToken = CancelToken    new axios.Axios();
axios.Axios = Axios;

// Factory for creating new instances
// 工厂函数  用来返回创建实例对象的函数
axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
    return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

//简单实现全局暴露 axios
window.axios = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

```

- 源码解读，情况axios目录，有注释。
