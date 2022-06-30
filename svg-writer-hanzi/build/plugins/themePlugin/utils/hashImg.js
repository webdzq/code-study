const path = require('path')
const {getRelativeURL, hashFile} = require('./common')

function hashImg(lessPath, content){
    const newContent = content.replace(/url\((['"]?)(.+)\1\)/g, function(match, emblem, url){
        const imgPath = path.join(lessPath, '../', url)
        const {
            hashedPath
        } = hashFile(imgPath)

        const newUrl = getRelativeURL(hashedPath, lessPath)
        
        return match.replace(url, newUrl)
    })
    return newContent
}

module.exports = hashImg