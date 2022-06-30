const fs = require("fs");
const path = require('path');
const {getFiles} = require('./common');
const isBuild = process.env.NODE_ENV === 'production'
const rootDir = isBuild ? 'static' : 'static' // 皮肤文件夹所在位置

module.exports = function generatorConfig(baseDir, pageName) {
    let pagePath = path.join(baseDir, pageName);
    let fileList = getFiles(pagePath, ['css', 'svga']); // 获取一个路由下所有的css,svga文件的路径
    if (isBuild) {
        fileList = fileList.filter(item => {
            return item.match(/\/([^/]+)\/[^/]+\.[^/]+$/)[1].startsWith('__')
        })
    }
    let bodyObj = {}
    fileList.forEach(item => {
        let reg = /theme\/[^/]+\/([^/]+)\//
        let themeName = item.match(reg)[1]

        bodyObj[themeName] = bodyObj[themeName] || {}
        let theme = bodyObj[themeName]

        if (/\.css$/.test(item)) {
            theme.style = rootDir + item.split('static')[1]
        }

        if (/\.svga$/.test(item)) {
            theme.svgas = theme.svgas || {}
            let svgaName = item.match(/([^/.]+)(\.\w{7})?\.svga$/)[1]
            theme.svgas[svgaName] = rootDir + item.split('static')[1]
        }
    })

    // 将数据写入配置文件
    let indent = process.env.NODE_ENV === 'production' ? false : 4
    writeToJson(pagePath, bodyObj, indent)
}

function writeToJson(pagePath, bodyObj, indent) {
    let fPath = path.join(pagePath, 'theme-config.json')
    let content = JSON.stringify(bodyObj, null, indent)

    fs.writeFile(fPath, content, function (err) {
        if (err) {
            console.log(`[saveJson] ${err}`);
        }
    });
}

// TODO:
function getThemeList(pagePath) {
    let files = fs.readdirSync(pagePath)
    let themeList = []
    files.forEach(file => {
        let fPath = path.join(pagePath, file);
        let isDir = fs.statSync(fPath).isDirectory();
        if (isDir) {
            themeList.push(file)
        }
    })
    return themeList
}
