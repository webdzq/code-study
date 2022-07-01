# 手写webpack

## 什么是webpack

- 本质上,`webpack` 是一个现代 `JavaScript` 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时,它会递归地构建一个依赖关系图(dependency graph),其中包含应用程序需要的每个模块,然后将所有这些模块打包成一个或多个`bundle`。
webpack 就像一条生产线,要经过一系列处理流程后才能将源文件转换成输出结果。 这条生产线上的每个处理流程的职责都是单一的,多个流程之间有存在依赖关系,只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能,在特定的时机对生产线上的资源做处理。
`webpack` 通过 `Tapable` 来组织这条复杂的生产线。 webpack 在运行过程中会广播事件,插件只需要监听它所关心的事件,就能加入到这条生产线中,去改变生产线的运作。 webpack 的事件流机制保证了插件的有序性,使得整个系统扩展性很好   -- 出自《深入浅出`webpack`》

## webpack核心概念

### Entry

- 入口起点(entry point)指示 webpack 应该使用哪个模块,来作为构建其内部依赖图的开始。
- 进入入口起点后,webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。
- 每个依赖项随即被处理,最后输出到称之为 bundles 的文件中。

### Output

- output 属性告诉 webpack 在哪里输出它所创建的 bundles,以及如何命名这些文件,默认值为 ./dist。
- 基本上,整个应用程序结构,都会被编译到你指定的输出路径的文件夹中。

### Module

- 模块,在 Webpack 里一切皆模块,一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。

### Chunk

- 代码块,一个 Chunk 由多个模块组合而成,用于代码合并与分割。

### Loader

- loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。
- loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块,然后你就可以利用 webpack 的打包能力,对它们进行处理。
- 本质上,webpack的loader 将所有类型的文件,转换为应用程序的依赖图（和最终的 bundle）可以直接引用的模块。

### Plugin

- loader 被用于转换某些类型的模块,而插件则可以用于执行范围更广的任务。
- 插件的范围包括,从打包优化和压缩,一直到重新定义环境中的变量。插件接口功能极其强大,可以用来处理各种各样的任务。

### Tree Shaking（树摇）

- `tree shaking` 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码(dead-code)。它依赖于 ES2015 模块语法的 静态结构 特性，例如 `import` 和 `export`。这个术语和概念实际上是由 ES2015 模块打包工具 `rollup` 普及起来的。

## webpack构建流程

- Webpack 的运行流程是一个串行的过程,从启动到结束会依次执行以下流程 :
  - 1、初始化参数：从配置文件和`Shell`语句中读取与合并参数,得出最终的参数。如`webpack.config.js`,`webpack --config build/webpack.dll.js`
  - 2、开始编译：用上一步得到的参数初始化 Compiler 对象,加载所有配置的插件,执行对象的 run 方法开始执行编译。
  - 3、确定入口：根据配置中的 entry 找出所有的入口文件。
  - 4、编译模块：从入口文件出发,调用所有配置的 Loader 对模块进行翻译,再找出该模块依赖的模块,再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
  - 5、完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后,得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。
  - 6、输出资源：根据入口和模块之间的依赖关系,组装成一个个包含多个模块的 Chunk,再把每个 Chunk 转换成一个单独的文件加入到输出列表,这步是可以修改输出内容的最后机会。
  - 7、输出完成：在确定好输出内容后,根据配置确定输出的路径和文件名,把文件内容写入到文件系统。
- 在以上过程中,Webpack 会在特定的时间点广播出特定的事件,插件在监听到感兴趣的事件后会执行特定的逻辑,并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

## 动手制作简单webpack

### 定义 Compiler 类

```js
// 编译类
class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() {}
  // 重写 require函数,输出bundle
  generate() {}
}
```

### 解析入口文件,获取 AST

- 我们这里使用@babel/parser,这是 babel7 的工具,来帮助我们分析内部的语法,包括 es6,返回一个 AST 抽象语法树。
- AST演示工具：<https://astexplorer.net/>

```js
// webpack.config.js 部分代码演示

const path = require('path')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js'
  }
}
//
```

```js
// webpack解析文件
const fs = require('fs')
const parser = require('@babel/parser')
const options = require('./webpack.config')

const Parser = { // 将配置文件内容转化为AST抽象语法树
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  }
}

class Compiler {// 编译类
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() { // 获取到抽象语法树
    const ast = Parser.getAst(this.entry)
  }
  // 重写 require函数,输出bundle
  generate() {}
}

new Compiler(options).run()
```

### 找出所有依赖模块

- Babel 提供了@babel/traverse(遍历)方法维护这 AST 树的整体状态,我们这里使用它来帮我们找出依赖模块。

```js
const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const Parser = {
  getAst: path => {//得到ast树
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {//找出依赖并存入dependecies中
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  }
}

class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() {
    const { getAst, getDependecies } = Parser
    const ast = getAst(this.entry)
    const dependecies = getDependecies(ast, this.entry)
  }
  // 重写 require函数,输出bundle
  generate() {}
}

new Compiler(options).run()

```

### AST 转换为 code

- 将 AST 语法树转换为浏览器可执行代码,我们这里使用`@babel/core` 和 `@babel/preset-env`。

```js
const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}

class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() {
    const { getAst, getDependecies, getCode } = Parser
    const ast = getAst(this.entry)
    const dependecies = getDependecies(ast, this.entry)
    const code = getCode(ast)
  }
  // 重写 require函数,输出bundle
  generate() {}
}

new Compiler(options).run()

```

### 递归解析所有依赖项,生成依赖关系图

```js

const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}

class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() {
    // 解析入口文件
    const info = this.build(this.entry)
    this.modules.push(info)
    this.modules.forEach(({ dependecies }) => {
      // 判断有依赖对象,递归解析所有依赖项
      if (dependecies) {
        for (const dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]))
        }
      }
    })
    // 生成依赖关系图
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        // 使用文件路径作为每个模块的唯一标识符,保存对应模块的依赖对象和文件内容
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    )
  }
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser
    const ast = getAst(filename)
    const dependecies = getDependecies(ast, filename)
    const code = getCode(ast)
    return {
      // 文件路径,可以作为每个模块的唯一标识符
      filename,
      // 依赖对象,保存着依赖模块路径
      dependecies,
      // 文件内容
      code
    }
  }
  // 重写 require函数,输出bundle
  generate() {}
}

new Compiler(options).run()
```

### 重写 require 函数,输出 bundle

```js
const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}

class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
  }
  // 构建启动
  run() {
    // 解析入口文件
    const info = this.build(this.entry)
    this.modules.push(info)
    this.modules.forEach(({ dependecies }) => {
      // 判断有依赖对象,递归解析所有依赖项
      if (dependecies) {
        for (const dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]))
        }
      }
    })
    // 生成依赖关系图
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        // 使用文件路径作为每个模块的唯一标识符,保存对应模块的依赖对象和文件内容
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    )
    this.generate(dependencyGraph)
  }
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser
    const ast = getAst(filename)
    const dependecies = getDependecies(ast, filename)
    const code = getCode(ast)
    return {
      // 文件路径,可以作为每个模块的唯一标识符
      filename,
      // 依赖对象,保存着依赖模块路径
      dependecies,
      // 文件内容
      code
    }
  }
  // 重写 require函数 (浏览器不能识别commonjs语法),输出bundle
  generate(code) {
    // 输出文件路径
    const filePath = path.join(this.output.path, this.output.filename)
    // 懵逼了吗? 没事,下一节我们捋一捋
    const bundle = `(function(graph){
      function require(module){
        function localRequire(relativePath){
          return require(graph[module].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[module].code);
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(code)})`

    // 把文件内容写入到文件系统
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}

new Compiler(options).run()

```

### 看完这节,彻底搞懂 bundle 实现

- 我们通过下面的例子来进行讲解,先死亡凝视 30 秒

```js
;(function(graph) {
  function require(moduleId) {
    function localRequire(relativePath) {
      return require(graph[moduleId].dependecies[relativePath])
    }
    var exports = {}
    ;(function(require, exports, code) {
      eval(code)
    })(localRequire, exports, graph[moduleId].code)
    return exports
  }
  require('./src/index.js')
})({
  './src/index.js': {
    dependecies: { './hello.js': './src/hello.js' },
    code: '"use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));'
  },
  './src/hello.js': {
    dependecies: {},
    code:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return "hello ".concat(name);\n}'
  }
})
```

#### step1,从入口文件开始执行

```js
// 定义一个立即执行函数,传入生成的依赖关系图
;(function(graph) {
  // 重写require函数
  function require(moduleId) {
    console.log(moduleId) // ./src/index.js
  }
  // 从入口文件开始执行
  require('./src/index.js')
})({
  './src/index.js': {
    dependecies: { './hello.js': './src/hello.js' },
    code: '"use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));'
  },
  './src/hello.js': {
    dependecies: {},
    code:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return "hello ".concat(name);\n}'
  }
})
```

#### step 2 : 使用 eval 执行代码,模拟`JavaScript`解析器

```js
// 定义一个立即执行函数,传入生成的依赖关系图
;(function(graph) {
  // 重写require函数
  function require(moduleId) {
    ;(function(code) {
      console.log(code) // "use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));
      eval(code) // Uncaught TypeError: Cannot read property 'code' of undefined
    })(graph[moduleId].code)
  }
  // 从入口文件开始执行
  require('./src/index.js')
})({
  './src/index.js': {
    dependecies: { './hello.js': './src/hello.js' },
    code: '"use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));'
  },
  './src/hello.js': {
    dependecies: {},
    code:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return "hello ".concat(name);\n}'
  }
})
```

可以看到,我们在执行"./src/index.js"文件代码的时候报错了,这是因为 index.js 里引用依赖 hello.js,而我们没有对依赖进行处理,接下来我们对依赖引用进行处理。

#### step 3 : 依赖对象寻址映射,获取 exports 对象

```js
// 定义一个立即执行函数,传入生成的依赖关系图
;(function(graph) {
  // 重写require函数
  function require(moduleId) {
    // 找到对应moduleId的依赖对象,调用require函数,eval执行,拿到exports对象
    function localRequire(relativePath) {
      return require(graph[moduleId].dependecies[relativePath]) // {__esModule: true, say: ƒ say(name)}
    }
    // 定义exports对象
    var exports = {}
    ;(function(require, exports, code) {
      // commonjs语法使用module.exports暴露实现,我们传入的exports对象会捕获依赖对象(hello.js)暴露的实现(exports.say = say)并写入
      eval(code)
    })(localRequire, exports, graph[moduleId].code)
    // 暴露exports对象,即暴露依赖对象对应的实现
    return exports
  }
  // 从入口文件开始执行
  require('./src/index.js')
})({
  './src/index.js': {
    dependecies: { './hello.js': './src/hello.js' },
    code: '"use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));'
  },
  './src/hello.js': {
    dependecies: {},
    code:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return "hello ".concat(name);\n}'
  }
})
```

完整代码参考：`e-webpack`
webpack源码：<https://github.com/webpack/webpack/tree/v5.48.0>
webpack文档：<https://webpack.docschina.org/guides/getting-started/>

## axios项目的webapck打包后的结构

```js
//第一层结构-立即执行函数(IIFE)，匹配模块化规范，如amd，cmd、es6-modules、CommonJS、umd等
(function webpackUniversalModuleDefinition(root, factory) {
 if(typeof exports === 'object' && typeof module === 'object')
  module.exports = factory();// cmd模式/CommonJS/umd
 else if(typeof define === 'function' && define.amd)
  define([], factory);// amd
 else if(typeof exports === 'object')
  exports["axios"] = factory(); // es6-modules
 else
  root["axios"] = factory();// 宿主模式
})(this, function() {
  // module
});
/**
 * vue源码：https://github.com/vuejs/vue/blob/dev/dist/vue.js
 * 适配各种模块化的代码
 * /
/*!
 * Vue.js v2.6.14
 * (c) 2014-2021 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () {
  // module
})
// 第二层： 返回一个函数，输入参数是一个modules数组。定义__webpack_require__函数
(function webpackUniversalModuleDefinition(root, factory) {
 if(typeof exports === 'object' && typeof module === 'object')
  module.exports = factory();// cmd模式/CommonJS/umd
 else if(typeof define === 'function' && define.amd)
  define([], factory);// amd
 else if(typeof exports === 'object')
  exports["axios"] = factory(); // es6-modules
 else
  root["axios"] = factory();// 宿主模式
})(this, function() {
  return (function(modules){
    //代码略
    function __webpack_require__(moduleId) {
      // 函数作用：约等于import能力，可以加载某模块
      // 代码略
      // The module cache
      var installedModules = {};
      var module = installedModules[moduleId] = {
        exports: {},
        id: moduleId,
        loaded: false
      };
      // Execute the module function 执行代码
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

      return module.exports;
    }
    return __webpack_require__(0);
  })([])
});
// 第三层 ，modules的详细内容：由函数组成的数组
(function webpackUniversalModuleDefinition(root, factory) {
 if(typeof exports === 'object' && typeof module === 'object')
  module.exports = factory();// cmd模式/CommonJS/umd
 else if(typeof define === 'function' && define.amd)
  define([], factory);// amd
 else if(typeof exports === 'object')
  exports["axios"] = factory(); // es6-modules
 else
  root["axios"] = factory();// 宿主模式
})(this, function() {
  return (function(modules){
    //代码略
    return __webpack_require__(0);
  })([
    /* 0 */
    (function(module, exports, __webpack_require__) {

       module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/* 2 */
/* 3-25略 */
/* 25 */
/***/ (function(module, exports) {
      'use strict';
      module.exports = function spread(callback) {
        return function wrap(arr) {
          return callback.apply(null, arr);
        };
      };
    })
  ])
});

// axios整体结构
/* axios v0.19.2 | (c) 2020 by Matt Zabriskie */
(function webpackUniversalModuleDefinition(root, factory) {
 if(typeof exports === 'object' && typeof module === 'object')
  module.exports = factory();
 else if(typeof define === 'function' && define.amd)
  define([], factory);
 else if(typeof exports === 'object')
  exports["axios"] = factory();
 else
  root["axios"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};
/******/
/******/  // The require function
/******/  function __webpack_require__(moduleId) {
/******/
/******/   // Check if module is in cache
/******/   if(installedModules[moduleId])
/******/    return installedModules[moduleId].exports;
/******/
/******/   // Create a new module (and put it into the cache)
/******/   var module = installedModules[moduleId] = {
/******/    exports: {},
/******/    id: moduleId,
/******/    loaded: false
/******/   };
/******/
/******/   // Execute the module function
/******/   modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/   // Flag the module as loaded
/******/   module.loaded = true;
/******/
/******/   // Return the exports of the module
/******/   return module.exports;
/******/  }
/******/
/******/
/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;
/******/
/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;
/******/
/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";
/******/
/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

 module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

 'use strict';
 
 var utils = __webpack_require__(2);
 var bind = __webpack_require__(3);
 var Axios = __webpack_require__(4);
 var mergeConfig = __webpack_require__(22);
 var defaults = __webpack_require__(10);
 
 /**
  * Create an instance of Axios
  *
  * @param {Object} defaultConfig The default config for the instance
  * @return {Axios} A new instance of Axios
  */
 function createInstance(defaultConfig) {
   var context = new Axios(defaultConfig);
   var instance = bind(Axios.prototype.request, context);
 
   // Copy axios.prototype to instance
   utils.extend(instance, Axios.prototype, context);
 
   // Copy context to instance
   utils.extend(instance, context);
 
   return instance;
 }
 
 // Create the default instance to be exported
 var axios = createInstance(defaults);
 
 // Expose Axios class to allow class inheritance
 axios.Axios = Axios;
 
 // Factory for creating new instances
 axios.create = function create(instanceConfig) {
   return createInstance(mergeConfig(axios.defaults, instanceConfig));
 };
 
 // Expose Cancel & CancelToken
 axios.Cancel = __webpack_require__(23);
 axios.CancelToken = __webpack_require__(24);
 axios.isCancel = __webpack_require__(9);
 
 // Expose all/spread
 axios.all = function all(promises) {
   return Promise.all(promises);
 };
 axios.spread = __webpack_require__(25);
 
 module.exports = axios;
 
 // Allow use of default import syntax in TypeScript
 module.exports.default = axios;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

 'use strict';
 
 var bind = __webpack_require__(3);
 
 /*global toString:true*/
 
 // utils is a library of generic helper functions non-specific to axios
 
 var toString = Object.prototype.toString;
 
 /**
  * Determine if a value is an Array
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is an Array, otherwise false
  */
 function isArray(val) {
   return toString.call(val) === '[object Array]';
 }
 
 /**
  * Determine if a value is undefined
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if the value is undefined, otherwise false
  */
 function isUndefined(val) {
   return typeof val === 'undefined';
 }
 
 /**
  * Determine if a value is a Buffer
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Buffer, otherwise false
  */
 function isBuffer(val) {
   return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
     && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
 }
 
 /**
  * Determine if a value is an ArrayBuffer
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is an ArrayBuffer, otherwise false
  */
 function isArrayBuffer(val) {
   return toString.call(val) === '[object ArrayBuffer]';
 }
 
 /**
  * Determine if a value is a FormData
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is an FormData, otherwise false
  */
 function isFormData(val) {
   return (typeof FormData !== 'undefined') && (val instanceof FormData);
 }
 
 /**
  * Determine if a value is a view on an ArrayBuffer
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
  */
 function isArrayBufferView(val) {
   var result;
   if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
     result = ArrayBuffer.isView(val);
   } else {
     result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
   }
   return result;
 }
 
 /**
  * Determine if a value is a String
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a String, otherwise false
  */
 function isString(val) {
   return typeof val === 'string';
 }
 
 /**
  * Determine if a value is a Number
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Number, otherwise false
  */
 function isNumber(val) {
   return typeof val === 'number';
 }
 
 /**
  * Determine if a value is an Object
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is an Object, otherwise false
  */
 function isObject(val) {
   return val !== null && typeof val === 'object';
 }
 
 /**
  * Determine if a value is a Date
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Date, otherwise false
  */
 function isDate(val) {
   return toString.call(val) === '[object Date]';
 }
 
 /**
  * Determine if a value is a File
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a File, otherwise false
  */
 function isFile(val) {
   return toString.call(val) === '[object File]';
 }
 
 /**
  * Determine if a value is a Blob
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Blob, otherwise false
  */
 function isBlob(val) {
   return toString.call(val) === '[object Blob]';
 }
 
 /**
  * Determine if a value is a Function
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Function, otherwise false
  */
 function isFunction(val) {
   return toString.call(val) === '[object Function]';
 }
 
 /**
  * Determine if a value is a Stream
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a Stream, otherwise false
  */
 function isStream(val) {
   return isObject(val) && isFunction(val.pipe);
 }
 
 /**
  * Determine if a value is a URLSearchParams object
  *
  * @param {Object} val The value to test
  * @returns {boolean} True if value is a URLSearchParams object, otherwise false
  */
 function isURLSearchParams(val) {
   return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
 }
 
 /**
  * Trim excess whitespace off the beginning and end of a string
  *
  * @param {String} str The String to trim
  * @returns {String} The String freed of excess whitespace
  */
 function trim(str) {
   return str.replace(/^\s*/, '').replace(/\s*$/, '');
 }
 
 /**
  * Determine if we're running in a standard browser environment
  *
  * This allows axios to run in a web worker, and react-native.
  * Both environments support XMLHttpRequest, but not fully standard globals.
  *
  * web workers:
  *  typeof window -> undefined
  *  typeof document -> undefined
  *
  * react-native:
  *  navigator.product -> 'ReactNative'
  * nativescript
  *  navigator.product -> 'NativeScript' or 'NS'
  */
 function isStandardBrowserEnv() {
   if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                            navigator.product === 'NativeScript' ||
                                            navigator.product === 'NS')) {
     return false;
   }
   return (
     typeof window !== 'undefined' &&
     typeof document !== 'undefined'
   );
 }
 
 /**
  * Iterate over an Array or an Object invoking a function for each item.
  *
  * If `obj` is an Array callback will be called passing
  * the value, index, and complete array for each item.
  *
  * If 'obj' is an Object callback will be called passing
  * the value, key, and complete object for each property.
  *
  * @param {Object|Array} obj The object to iterate
  * @param {Function} fn The callback to invoke for each item
  */
 function forEach(obj, fn) {
   // Don't bother if no value provided
   if (obj === null || typeof obj === 'undefined') {
     return;
   }
 
   // Force an array if not already something iterable
   if (typeof obj !== 'object') {
     /*eslint no-param-reassign:0*/
     obj = [obj];
   }
 
   if (isArray(obj)) {
     // Iterate over array values
     for (var i = 0, l = obj.length; i < l; i++) {
       fn.call(null, obj[i], i, obj);
     }
   } else {
     // Iterate over object keys
     for (var key in obj) {
       if (Object.prototype.hasOwnProperty.call(obj, key)) {
         fn.call(null, obj[key], key, obj);
       }
     }
   }
 }
 
 /**
  * Accepts varargs expecting each argument to be an object, then
  * immutably merges the properties of each object and returns result.
  *
  * When multiple objects contain the same key the later object in
  * the arguments list will take precedence.
  *
  * Example:
  *
  * ```js
  * var result = merge({foo: 123}, {foo: 456});
  * console.log(result.foo); // outputs 456
  * ```
  *
  * @param {Object} obj1 Object to merge
  * @returns {Object} Result of all merge properties
  */
 function merge(/* obj1, obj2, obj3, ... */) {
   var result = {};
   function assignValue(val, key) {
     if (typeof result[key] === 'object' && typeof val === 'object') {
       result[key] = merge(result[key], val);
     } else {
       result[key] = val;
     }
   }
 
   for (var i = 0, l = arguments.length; i < l; i++) {
     forEach(arguments[i], assignValue);
   }
   return result;
 }
 
 /**
  * Function equal to merge with the difference being that no reference
  * to original objects is kept.
  *
  * @see merge
  * @param {Object} obj1 Object to merge
  * @returns {Object} Result of all merge properties
  */
 function deepMerge(/* obj1, obj2, obj3, ... */) {
   var result = {};
   function assignValue(val, key) {
     if (typeof result[key] === 'object' && typeof val === 'object') {
       result[key] = deepMerge(result[key], val);
     } else if (typeof val === 'object') {
       result[key] = deepMerge({}, val);
     } else {
       result[key] = val;
     }
   }
 
   for (var i = 0, l = arguments.length; i < l; i++) {
     forEach(arguments[i], assignValue);
   }
   return result;
 }
 
 /**
  * Extends object a by mutably adding to it the properties of object b.
  *
  * @param {Object} a The object to be extended
  * @param {Object} b The object to copy properties from
  * @param {Object} thisArg The object to bind function to
  * @return {Object} The resulting value of object a
  */
 function extend(a, b, thisArg) {
   forEach(b, function assignValue(val, key) {
     if (thisArg && typeof val === 'function') {
       a[key] = bind(val, thisArg);
     } else {
       a[key] = val;
     }
   });
   return a;
 }
 
 module.exports = {
   isArray: isArray,
   isArrayBuffer: isArrayBuffer,
   isBuffer: isBuffer,
   isFormData: isFormData,
   isArrayBufferView: isArrayBufferView,
   isString: isString,
   isNumber: isNumber,
   isObject: isObject,
   isUndefined: isUndefined,
   isDate: isDate,
   isFile: isFile,
   isBlob: isBlob,
   isFunction: isFunction,
   isStream: isStream,
   isURLSearchParams: isURLSearchParams,
   isStandardBrowserEnv: isStandardBrowserEnv,
   forEach: forEach,
   merge: merge,
   deepMerge: deepMerge,
   extend: extend,
   trim: trim
 };


/***/ }),
/* 3 */
/***/ (function(module, exports) {

 'use strict';
 
 module.exports = function bind(fn, thisArg) {
   return function wrap() {
     var args = new Array(arguments.length);
     for (var i = 0; i < args.length; i++) {
       args[i] = arguments[i];
     }
     return fn.apply(thisArg, args);
   };
 };


/***/ }),
/* 4-24 略 */
/* 25 */
/***/ (function(module, exports) {

 'use strict';
 
 /**
  * Syntactic sugar for invoking a function and expanding an array for arguments.
  *
  * Common use case would be to use `Function.prototype.apply`.
  *
  *  ```js
  *  function f(x, y, z) {}
  *  var args = [1, 2, 3];
  *  f.apply(null, args);
  *  ```
  *
  * With `spread` this example can be re-written.
  *
  *  ```js
  *  spread(function(x, y, z) {})([1, 2, 3]);
  *  ```
  *
  * @param {Function} callback
  * @returns {Function}
  */
 module.exports = function spread(callback) {
   return function wrap(arr) {
     return callback.apply(null, arr);
   };
 };


/***/ })
])
});
;
//# sourceMappingURL=axios.map

```

[webpack简单学习（ruanyf）](https://github.com/ruanyf/webpack-demos)
[深入浅出webpack](https://webpack.wuhaolin.cn/)
[webpack源码解析](https://github.com/lihongxun945/diving-into-webpack)
