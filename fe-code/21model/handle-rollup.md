
# rollup揭秘

- Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。Rollup 对代码模块使用新的标准化格式，这些标准都包含在 JavaScript 的 ES6 版本中，而不是以前的特殊解决方案，如 CommonJS 和 AMD。ES6 模块可以使你自由、无缝地使用你最喜爱的 library 中那些最有用独立函数，而你的项目不必携带其他未使用的代码。ES6 模块最终还是要由浏览器原生实现，但当前 Rollup 可以使你提前体验。

## 源码学习

从`mini-rollup/lib/rollup.js`开始看，

## 重要知识点

### tree-shaking

- 除了使用 ES6 模块之外，Rollup 还静态分析代码中的 import，并将排除任何未实际使用的代码。这允许您架构于现有工具和模块之上，而不会增加额外的依赖或使项目的大小膨胀。

- 例如，在使用 CommonJS 时，必须导入(import)完整的工具(tool)或库(library)对象。

```js

// 使用 CommonJS 导入(import)完整的 utils 对象
var utils = require( 'utils' );
var query = 'Rollup';
// 使用 utils 对象的 ajax 方法
utils.ajax( 'https://api.example.com?search=' + query ).then( handleResponse );

```

- 但是在使用 `ES6` 模块时，无需导入整个 `utils` 对象，我们可以只导入(import)我们所需的 ajax 函数：

```js
// 使用 ES6 import 语句导入(import) ajax 函数
import { ajax } from 'utils';
var query = 'Rollup';
// 调用 ajax 函数
ajax( 'https://api.example.com?search=' + query ).then( handleResponse );

```

- 因为 `Rollup` 只引入最基本最精简代码，所以可以生成轻量、快速，以及低复杂度的 `library` 和应用程序。因为这种基于显式的 `import` 和 `export` 语句的方式，它远比「在编译后的输出代码中，简单地运行自动 `minifier` 检测未使用的变量」更有效。

##

参考文档：[中文文档](https://rollupjs.org/guide/zh/#introduction)
