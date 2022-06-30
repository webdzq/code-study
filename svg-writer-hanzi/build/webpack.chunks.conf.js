var path = require('path')
var webpack = require('webpack')


function getModuleName(module) {
    var sign = 'node_modules';
    var signIndex = module.resource.indexOf(sign);
    var pathSeparator = module.resource.slice(signIndex - 1, signIndex);
    var modulePath = module.resource.substring(signIndex + sign.length + 1);
    var moduleName = modulePath.substring(0, modulePath.indexOf(pathSeparator));
    moduleName = moduleName.toLowerCase();

    return moduleName
}


// 需要chunks的包列表，支持正则
let chunksPackage = {
    'sdk': ['vue-router', 'raven-js', 'axios'],
    'vue': ['vue'],
}

exports.chunksWebpackConfig = {
    plugins: [
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),
        ...Object.keys(chunksPackage).map(packageName => {
            return new webpack.optimize.CommonsChunkPlugin({
                name: packageName,
                chunks: ['vendor'],
                minChunks: function (module, count) {
                    return module.resource && chunksPackage[packageName].filter(item => new RegExp(item).test(getModuleName(module)))[0] && count >= 1
                }
            })
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'utils',
            chunks: ['app'],
            minChunks: function (module, count) {
                return /utils/.test(module.resource)
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: Infinity,
        }),
    ],
}

exports.htmlWebpackConfig = {
    chunks: ['manifest', 'core', 'vue', 'vendor', 'sdk', 'utils', 'app'],
}
