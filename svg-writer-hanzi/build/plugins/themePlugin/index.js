
const devHook = require('./devHook')
const buildHook = require('./buildHook')
const {execSync} = require('child_process')

class CompileLess {
    constructor(options) {
        this.options = options
        this.watchExit()
    }
    apply(compiler) {
        compiler.plugin('entry-option', this.hook.bind(this))
    }
    hook(){
        const toDelList = [
            '*.???????.*',
            '*.css',
            '*.json',
            '__*'
        ]
        this.clear(toDelList).then(() => {
            process.env.NODE_ENV === 'production'
                ? buildHook.call(this)
                : devHook.call(this)
        })
    }
    clear(list){
        list.forEach(item => {
            execSync(`find ./static -name "${item}" | xargs rm -rf`)
        })
        return Promise.resolve()
    }
    watchExit() {
        process.on('exit', () => {
            this.child && this.child.kill()
        });
    }
}


module.exports = CompileLess