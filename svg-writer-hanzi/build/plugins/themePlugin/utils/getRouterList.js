const path = require('path')
const fs = require('fs')

function getRouterList(){
    let dir = path.join(process.cwd(), 'static/theme')
    const list = fs.readdirSync(dir)
    return list.filter(item => {
        let fPath = path.join(dir, item)
        return fs.statSync(fPath).isDirectory()
    })
}

module.exports = getRouterList