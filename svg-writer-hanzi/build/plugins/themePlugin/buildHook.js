function buildHook(){
    let baseDir = this.options.path
    
    // 生成css
    const generatorCss = require('./utils/generatorCss')
    generatorCss(baseDir)

    // hash svga
    const {getFiles, hashFile} = require('./utils/common')
    getFiles(baseDir, 'svga').forEach(hashFile)

    // 生成皮肤配置
    const generatorConfig = require('./utils/generatorConfig')
    let routerList = require('./utils/getRouterList')(baseDir)
    
    routerList.forEach(route => generatorConfig(baseDir, route))
}

module.exports = buildHook