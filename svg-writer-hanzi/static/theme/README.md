# 皮肤配置说明文档

## 注意：
因为皮肤样式文件是动态插入，所以有些常用class名会污染页面。
为规避此现象，每个页面必须起一个私有class名，格式为`__<page>_theme`，用来限制class作用域，避免全局污染。如：
```css
.rank-list.__rankList_theme {
    .title {}
    .body {}
    .footer {}
}
```

## 流程
1. 在`static/theme`下建立对应页面(路由)的文件夹，如有，跳[2]
2. 在`static/theme/xxx`下（以`test`页面为例），建立所需主题文件夹
目录结构为
```
├── static
    ├── theme
        ├── test
            ├── immerse_1  // 主题名
                ├── styles // 样式所在目录
                    ├── index.css // 自动生成，不用关心
                    └── index.less
                └── svgas // svga 动画所在目录
                    ├── 1.svga
                    ├── 2.svga
            ├── immerse_2
                ├── styles
                    ├── ......
                ├── svgas
                    ├── ......
            ├── etc.
```
3. 在对应路由文件夹下建立`theme-config.json`文件，用来记录主题内容
配置结构为：
```
{
    "immerse_1": {
        "style": "static/theme/test/immerse_1/styles/index.css", // 此处填写css
        "svgas": {
            "open": "static/theme/test/immerse_1/svga/open.svga",
            "close": "static/theme/test/immerse_1/svga/close.svga"
        }
    },
    "immerse_2": {
        "style": "static/theme/test/immerse_2/styles/index.css",
        "svgas": {
            "open": "static/theme/test/immerse_2/svga/open.svga",
            "close": "static/theme/test/immerse_2/svga/close.svga"
        }
    }
}
```
4. 在页面中引入配置文件
```js
import themeConfig from 'static/theme/test/theme-config';
```
根据url上传过来的参数来确定选用哪套皮肤，如
```js
const type = this.$route.tpl // immerse_1
this.theme = themeConfig[type]
// 然后调用loadStyle方法来加载皮肤css
this.$utils.loadStyle(this.theme.style)
// 页面中用到的动画可以使用来获取
this.openSvgaUrl = this.theme.svga.open // 开始的动画
```