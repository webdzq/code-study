const loaderUtils = require('loader-utils')
const mime = require('mime')

function loader(source) {
    const options = loaderUtils.getOptions(this)

    const file = this.resourcePath
    
    if (typeof source === 'string') {
        source = Buffer.from(source)
    }

    let {
        mimetype = mime.lookup(file), // 文件类型
        expectFiles = []
    } = options

    expectFiles = Array.isArray(expectFiles) ? expectFiles : [expectFiles]

    for(let i = 0; i < expectFiles.length; i++){
        if (file.includes(expectFiles[i])) {
            return `module.exports = ${JSON.stringify(`data:${mimetype || ''};base64,${source.toString('base64')}`)}`
        }
    }

    const fallback = require('url-loader')
    
    const fallbackLoaderContext = Object.assign({}, this, {
        query: options
    })

    return fallback.call(fallbackLoaderContext, source)
}

module.exports = loader
module.exports.raw = true
