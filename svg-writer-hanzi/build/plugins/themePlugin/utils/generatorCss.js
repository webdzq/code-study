const {getFiles} = require('./common')
const less2css = require('./less2css')

module.exports = function (path) {
    const lessFiles = getFiles(path, 'less')
    lessFiles.forEach(file => less2css('add', file))
}