# mweb

## 主要实现

> 写字训练实现，主要技术点：svg+howler+HanziWriter
> 业务流程：初始化一个字，自动示范写一次，然后播放提升音频，开始手写，可以写2次。支持ios/android切入
> 项目难点：主线是写字，同时兼容客户端及切入和切出，笔画提示定时器及毛笔图片的跟随动画，音频播放等逻辑比较多，还有svg的一些动画
> 访问地址：`http://localhost:8081/qz?m=1&z=字`
![写字](/z1.png)

### 项目环境 vue + mint-ui

> vue 官方文档：[https://cn.vuejs.org/v2/guide/](https://cn.vuejs.org/v2/guide/)

> mint-ui 官方文档：[https://mint-ui.github.io/docs/#/](https://mint-ui.github.io/docs/#/)

## Build Setup

``` bash

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

### 项目结构

```

├── build
 ├── ...
    ├── utils.js (px2remLoader)
    └── webpack.base.conf.js

├── config
 ├── ...
    └── index.js (proxyTable)                //跨域相关
├── dist
├── node_modules
├── src
 ├── api                                 //接口
 ├── assets
   ├── css                         //公共CSS
   └── imgs                        //项目图片
 ├── router
      └──  index.js                   //路由
    ├── utils
      ├── habo.config.js              //哈勃配置
      ├── http.js                     //axios封装请求
      ├── sentry.config.js            //sentry配置
      ├── umeng.config.js             //友盟（埋点）配置
            ├── utils.js                    //封装的函数（ua判断，PostMessage，获取url参数等）
      ├── Vue.prototype.config.js     //挂载至Vue原型上的模块
    ├── views        //默认没有适配app，除非特别声明
   ├── beforeClassQuiz             //课前测模块
   ├── beforeClassQuiz-app         //课前测模块app
         ├── checkIn                     //签到模块
            ├── exercise                    //小测模块
            ├── newBeforeExercise           //新-课前测
            ├── newExercise                 //新-随堂测
   ├── optionsCard                 //选项卡模块(适配app)
            ├── rank                        //排行榜模块
   ├── receiveClass                //课程推荐模块
            ├── redEnvelope                 //红包模块
   ├── voiceAssess                 //语音评测模块
            ├── helloWorld.vue              //欢迎页
    ├── App.vue                        //入口
    └── mian.js                        //公共入口JS
├── static                             //静态资源图片，favicon.ico
├── index.html

```

### 注意问题

- 1. 网站favicon.ico 需要放在static 文件夹，index.html引入；
- 2. 端口不一致，本地开发vue运行项目，无法请求本地mock服务数据，通过设置 webpack 的 proxyTable代理；
- 3. 动态图片需要提前 import 引入，否则无法渲染；
- 4. 与APP交互，需注意this 指针；
- 5. webpack.prod.conf.js设置UglifyJsPlugin 去掉log输出；
- 6. 尽量不要再dom里面计算，直接在data里面存上dom需要的值，避免重复计算，影响代码性能；
- 7. 图片import进来，会被webpack解析为base64，减少请求数；

### 为vscode配置eslint

1. 安装`ESlint`扩展
2. 打开vscode配置文件，添加以下配置

```json
{
    /// ...原先的设置,
    "eslint.autoFixOnSave": true, // 保存自动修复
    "eslint.validate": [
        "javascript",
        {
            "language": "vue",
            "autoFix": true
        }
    ],
    "eslint.options": {
        // 为插件指定一个配置文件
        "configFile": "/Users/xxx/gitlab/mweb/.eslintrc.js" // 填写本项目根目录下的.eslintrc.js文件的路径
    }
}
```
