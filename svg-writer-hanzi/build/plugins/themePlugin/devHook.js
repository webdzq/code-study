const childProcess = require('child_process')
const path = require('path')

function devHook(){
    this.child = childProcess.fork(path.join(__dirname, './utils/watchFileChange.js'), [this.options.path])
}

module.exports = devHook