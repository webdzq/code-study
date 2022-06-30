const chokidar = require('chokidar');
const less2css = require('./less2css');
const generatorConfig = require('./generatorConfig');
const {debounce} = require('./common')

const pageMap = {}

// 皮肤所在文件夹
const baseDir = process.argv[2]

// 哪些格式改动需要重新生成皮肤配置
const fileType = [
    'css',
    'svga'
]

// 监听static下文件改动
chokidar.watch(baseDir).on('all', (event, path) => {
    // 编译less
    if(/\.less$/.test(path)){
        less2css(event, path)
    }
    
    // 生成皮肤配置
    const themeRelateFileReg = new RegExp('\\.(' + fileType.join('|') + ')$')
    if(event !== 'change' && themeRelateFileReg.test(path)){
        let pageHandle = createPageHandle(path)
        pageHandle() // 生成对应路由的皮肤配置
    }
});

// 生成【用于生成单个路由的配置】的防抖函数（每个路由只需生成一遍，不然耗费性能）
function createPageHandle(path){
    const pathReg = new RegExp((baseDir + '/([^/]+)\/').replace('//', '/'))
    let pageName = path.match(pathReg)[1]

    let pageFn = debounce(generatorConfig, 200, baseDir, pageName)

    pageMap[pageName] = pageMap[pageName] || pageFn
    return pageMap[pageName]
}

