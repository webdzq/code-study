const fs = require("fs");
const less = require("less");
const LessPluginAutoPrefix = require('less-plugin-autoprefix')
const chalk = require('chalk')
const hashImg = require('./hashImg')
const {hashFile} = require('./common')

const isBuild = process.env.NODE_ENV === 'production'
const hashMap = {}

// 编译less生成css
function less2css(event, lessPath) {
    if (event === 'unlink') {
        deleteCssFile(lessPath)
        return false
    }
    let fileContent = fs.readFileSync(lessPath, "utf-8");
    if (isBuild) {
        fileContent = hashImg(lessPath, fileContent)
    }
    less.render(fileContent, {
        compress: true,
        plugins: [
            new LessPluginAutoPrefix()
        ]
    }, function (error, output) {
        if (error) {
            showError(error)
        } else {
            const cssPath = lessPath.replace('.less', '.css')
            deleteCssFile(lessPath) // 删除上次一的css
            fs.writeFileSync(cssPath, output.css, "utf-8"); // 写入新的css
            hashMap[lessPath] = cssPath

            if(isBuild){
                hashFile(cssPath)
            }
        }
    });

    function deleteCssFile(lessPath) {
        if (hashMap[lessPath] && fs.existsSync(hashMap[lessPath])) {
            fs.unlinkSync(hashMap[lessPath], err => {
                console.log(err)
            })
        }
    }
}

function showError(error){
    const { message, type, line, column, extract } = error
    console.log(
        chalk.red('编译less出错：'),
        lessPath.split('interactive-student-z/')[1]
    )
    console.log(
        chalk.red(`${type} Error`),
        `第${line}行${column}列: `,
        chalk.red(`>>> ${extract[1].trim()}`)
    )
}

module.exports = less2css