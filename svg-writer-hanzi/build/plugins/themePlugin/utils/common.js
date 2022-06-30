const fs = require('fs');
const { join } = require('path');
const crypto = require('crypto');

// 防抖
exports.debounce = function debounce(fn, wait, ...args) {    
    var timer = null;    
    return function() {        
        if(timer !== null)   clearTimeout(timer);        
        timer = setTimeout(fn, wait, ...args);    
    }
}

// 获取两个文件的相对路径
exports.getRelativeURL = function getRelativeURL(relative, absolute) {
	var rArr = relative.split('/')
	var aArr = absolute.split('/')

	for (var i = 0; i < rArr.length; i++) {
		if (rArr[i] !== aArr[i]) {
			break
		}
	}
	rArr.splice(0, i)
	aArr.splice(0, i)

	let str = ''
	if (aArr.length === 1) {
		str = './'
	} else {
		str = '../'.repeat(aArr.length - 1)
	}

	return str + rArr.join('/')
}

// 给文件添加hash
exports.hashFile = function hashFile(fPath){
    const md5 = getFileMD5(fPath).substring(0, 7)
    const _fPath = fPath.replace(/(?=)(\.[^\.]+)$/, `.${md5}$1`)
    const hashPath = _fPath.replace(/(.*\/)([^/]+\/)([^/]+\.[^/.]+)$/, '$1__$2$3')
    
    copyFile(fPath, hashPath)

    return {
        primaryFullPath: fPath, // 原始完整路径
        hashedPath: hashPath, // 加hash后的完整路径
        primaryDir: RegExp.$2, // 原始的上层目录名
        hashedDir: '__' + RegExp.$2, // 加hash后的上层目录名
        primaryFileName: fPath.match(/\/([^/]+$)/)[1], // 原始文件名
        hashedFileName: RegExp.$3, // 加hash后的文件名
        md5 // md5值
    }
}

// 获取一类型文件
exports.getFiles = function getFiles(src, types) {
    let fileList = [];

    function findFile(path) {
        let files = fs.readdirSync(path);
        files.forEach(function (item, index) {
            let fPath = join(path, item);
            let stat = fs.statSync(fPath);
            if (stat.isDirectory()) {
                findFile(fPath);
            }
            let fileReg = new RegExp('.')
            if(types){
                types = Array.isArray(types) ? types : [types]
                fileReg = new RegExp('\\.(' + types.join('|') + ')$', 'i')
            }
            if (stat.isFile() && fileReg.test(item)) {
                fileList.push(fPath);
            }
        });
    }

    findFile(src);

    return fileList
}

// 拷贝文件
function copyFile(fPath, hashPath){
    const hashedDirPath = join(hashPath, '..')
    
    if (!fs.existsSync(hashedDirPath)) {
        fs.mkdirSync(hashedDirPath)
    }
    
    fs.copyFileSync(fPath, hashPath)
}

// 获取文件md5
function getFileMD5(fPath){
    //读取一个Buffer
    const buffer = fs.readFileSync(fPath);
    const fsHash = crypto.createHash('md5');
    
    fsHash.update(buffer);
    const md5 = fsHash.digest('hex');
    return md5
}
