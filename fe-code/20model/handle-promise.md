# 手写promise

## 术语

- 解决 (fulfill) : 指一个 promise 成功时进行的一系列操作，如状态的改变、回调的执行。虽然规范中用 fulfill 来表示解决，但在后世的 promise 实现多以 resolve 来指代之。
- 拒绝（reject) : 指一个 promise 失败时进行的一系列操作。
- 拒因 (reason) : 也就是拒绝原因，指在 promise 被拒绝时传递给拒绝回调的值。
- 终值（eventual value） : 所谓终值，指的是 promise 被解决时传递给解决回调的值，由于 promise 有一次性的特征，因此当这个值被传递时，标志着 promise 等待态的结束，故称之终值，有时也直接简称为值（value）。
- Promise : promise 是一个拥有 then 方法的对象或函数，其行为符合本规范。
- thenable : 是一个定义了 then 方法的对象或函数，文中译作“拥有 then 方法”。
- 异常（exception） : 是使用 throw 语句抛出的一个值。

## 常用函数

```js
1、Promise类实现，包括then、catch、all、race等方法
2、Promise类函数resolve, reject等实现
3、重难点在于：状态改变，链式调用、all实现、异常捕获、异步调用等

```

## 函数实现

```js

/**
 * 
 * promise特点
 * 1、是一个状态机，只有resolve和reject函数才能改变状态，try……catch情况下通过reject函数也可以变更状态
 * 2、结果只能从then函数中获取
 * 3、有2个属性：promiseState 和 promiseResult，即状态和结果
 * 4、通过返回自己实现then链式调用，做到生生不息
 * 5、resolve和reject函数只是执行改变状态，不返回任何值
 */

// 1。基本搭建
function Promise(executor) {
    executor() // 【同步调用】执行器函数
}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
// 待定
}


// 示例,执行器有2个参数:resolve和reject，从哪里来呢?
const p = new Promise((resolve, reject) => {
    resolve('OK')
})
p.then(value => {
    console.log(value)
}, reason => {
    console.warn(reason)
})

// 2。添加resolve, reject函数
function Promise(executor) {
    // resolve函数
    function resolve(data) {
        // 成功返回
    }
    //  reject函数
    function reject(data) {
        // 失败返回
    }
    executor(resolve, reject) // 【同步调用】执行器函数

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
// 待定
}


// 3.完善resolve, reject函数.
/**
 * 
 * @param {*} executor 执行器
 * 1、resolve和reject改变promise的状态
 * 2、promise有2个属性：状态和值
 */
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending'
    this.promiseResult = null
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data

    }
    executor(resolve, reject) // 【同步调用】执行器函数

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
// 待定
}
// 4.容错处理try……catch处理并修改状态
/**
 * 
 * @param {*} executor  执行器
 * 1、改变promise的状态有3中情况：resolve、reject和 抛出异常
 */
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending'
    this.promiseResult = null
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data

    }
    try {
        executor(resolve, reject) // 【同步调用】执行器函数   
    } catch (error) {
        // 修改promise的状态为reject
        reject(error)
    }

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
// todo
}
// 5.设置状态只能更改一下。只能在pending状态下变更状态
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending'
    this.promiseResult = null
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data

    }
    try {
        executor(resolve, reject) // 【同步调用】执行器函数   
    } catch (error) {
        // 修改promise的状态为reject
        reject(error)
    }

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
// todo
}
// 6.完善then方法
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending'
    this.promiseResult = null
    //同上
}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    if (this.promiseState === 'fulfilled') {
        onResolved(this.promiseResult)
    }
    if (this.promiseState === 'rejected') {
        onRejected(this.promiseResult)
    }
}
// 7.支持异步回调处理。上边实现都是同步执行的;要支持异步，需要在pending状态保存执行函数
/**
 * 
 * 1、先定义一个保存异步执行函数的对象：callback= {}
 * 2、在then函数里，pending状态下，保存then待执行的函数
 * 3、虽然是异步，执行的时候总是会调用resolve和reject中的一个，所以在resolve和reject中执行异步的回调
 */
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending' // 状态
    this.promiseResult = null // 结果
    this.callback = {}// 异步回调保存,关键代码
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
        if (this.callback.onResolved) {//执行异步回调函数,关键代码
            this.callback.onResolved(data)
        }
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data
        if (this.callback.onRejected) {//执行异步回调函数,关键代码
            this.callback.onRejected(data)
        }

    }
    try {
        executor(resolve, reject) // 【同步调用】执行器函数   
    } catch (error) {
        // 修改promise的状态为reject
        reject(error)
    }

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    if (this.promiseState === 'fulfilled') {
        onResolved(this.promiseResult)
    }
    if (this.promiseState === 'rejected') {
        onRejected(this.promiseResult)
    }
    //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调,关键代码
    if (this.promiseState === 'Pending') {
        this.callback = {
            onResolved,
            onRejected
        }
    }
}
// 示例
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
p.then(value => {
    console.log(value)
}, reason => {
    console.warn(reason)
})
// 8.上边不完美的地方，只支持单个异步回调，下边实现支持多个回调，使用数组来存储
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending' // 状态
    this.promiseResult = null // 结果
    this.callback = []// 异步回调保存，关键代码
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        // 5.执行异步回调函数
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
        //执行异步回调函数，关键代码
        self.callback.forEach(element => {
            element.onResolved(data)
        });
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        // 5.执行异步回调函数
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data
        //执行异步回调函数，关键代码
        self.callback.forEach(element => {
            element.onRejected(data)
        });

    }
    try {
        executor(resolve, reject) // 【同步调用】执行器函数   
    } catch (error) {
        // 修改promise的状态为reject
        reject(error)
    }

}
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    if (this.promiseState === 'fulfilled') {
        onResolved(this.promiseResult)
    }
    if (this.promiseState === 'rejected') {
        onRejected(this.promiseResult)
    }
    //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调，关键代码
    if (this.promiseState === 'Pending') {
        this.callback.push({
            onResolved,
            onRejected
        })
    }
}
// 示例,多个then执行。
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
p.then(value => {
    console.log(value)
}, reason => {
    console.warn(reason)
})
p.then(value => {
    console.log(value)
}, reason => {
    console.warn(reason)
})

//9. 优化then函数，返回promise，并对返回结果处理,处理异常,以成功分支为例
// promise构造函数代码略，同上
// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    // 3.区分promise返回和then返回。
    // onResolved, onRejected是then返回；resolve, reject是promise返回
    // 
    return new Promise((resolve, reject) => {
        if (this.promiseState === 'fulfilled') {
            try {
                let result = onResolved(this.promiseResult)
                // result有两种情况：1）是一个promise，2）非promise
                if (result instanceof Promise) {
                    // 如果是promise，就调用then执行
                    result.then((v) => {
                        resolve(v)
                    }, r => {
                        reject(r)
                    })
                } else {
                    //把结果状态变成【成功】
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        }
        if (this.promiseState === 'rejected') {
            onRejected(this.promiseResult)
        }
        //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
        if (this.promiseState === 'Pending') {
            this.callback.push({
                onResolved,
                onRejected
            })
        }

    })

}
// 示例,then返回值
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
let res = p.then(value => {
    //抛出异常
    throw 'fail'
}, reason => {
    console.warn(reason)
})
console.log(res)

// 10.then支持异步任务，主要修改this.promiseState === 'Pending'分支
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    const self = this
    return new Promise((resolve, reject) => {
        // 同上
        //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
        if (this.promiseState === 'Pending') {
            this.callback.push({
                onResolved: function () {
                    try {

                        let result = onResolved(self.promiseResult)
                        // result有两种情况：1）是一个promise，2）非promise
                        if (result instanceof Promise) {
                            // 如果是promise，就调用then执行
                            result.then((v) => {
                                resolve(v)
                            }, r => {
                                reject(r)
                            })
                        } else {
                            //把结果状态变成【成功】
                            resolve(result)
                        }
                    } catch (error) {
                        reject(error)
                    }

                },
                onRejected: function () {
                    try {

                        let result = onRejected(self.promiseResult)
                        // result有两种情况：1）是一个promise，2）非promise
                        if (result instanceof Promise) {
                            // 如果是promise，就调用then执行
                            result.then((v) => {
                                resolve(v)
                            }, r => {
                                reject(r)
                            })
                        } else {
                            //把结果状态变成【成功】
                            resolve(result)
                        }
                    } catch (error) {
                        reject(error)
                    }
                },
            })
        }

    })

}
// 示例,then执行，抛出异常
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
let res = p.then(value => {
    //抛出异常
    throw 'fail'
}, reason => {
    console.warn(reason)
})
console.log(res)

// 11.then函数完善，提取公共代码，发现有很多相似代码，进行提取
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    const self = this

    return new Promise((resolve, reject) => {
        const resTmplCbk = function (type) {//提取公共函数，结果模板回调函数
            try {
                let result = type(self.promiseResult)
                // result有两种情况：1）是一个promise，2）非promise
                if (result instanceof Promise) {
                    // 如果是promise，就调用then执行
                    result.then((v) => {
                        resolve(v)
                    }, (r) => {
                        reject(r)
                    })
                } else {
                    //把结果状态变成【成功】
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        }
        if (this.promiseState === 'fulfilled') {
            resTmplCbk(onResolved)
        }
        if (this.promiseState === 'rejected') {
            resTmplCbk(onRejected)

        }
        //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
        if (this.promiseState === 'Pending') {
            this.callback.push({
                onResolved: function () {
                    resTmplCbk(onResolved)
                },
                onRejected: function () {
                    resTmplCbk(onRejected)
                },
            })
        }

    })

}
// 示例,then返回值处理
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
let res = p.then(value => {
    console.log('OK')

}, reason => {
    console.warn(reason)
})
console.log(res)

// 12. 异常catch函数实现，及补全then对rejected不传递时的处理,异常穿透功能

Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    const self = this

    return new Promise((resolve, reject) => {
        const resTmplCbk = function (type) {//提取公共函数
            try {
                let result = type(self.promiseResult)
                // result有两种情况：1）是一个promise，2）非promise
                if (result instanceof Promise) {
                    // 如果是promise，就调用then执行
                    result.then((v) => {
                        resolve(v)
                    }, (r) => {
                        reject(r)
                    })
                } else {
                    //把结果状态变成【成功】
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        }
        // onRejected和onResolved如果没有传递，就给个默认
        if (onRejected !== 'function') {//如果没有传递，就默认,实现异常穿透
            onRejected = reason => {
                throw 'reason'
            }
        }
        if (onResolved !== 'function') {//如果没有传递，就默认,实现值穿透
            onResolved = value => value
        }

        if (this.promiseState === 'fulfilled') {
            resTmplCbk(onResolved)
        }
        if (this.promiseState === 'rejected') {
            resTmplCbk(onRejected)

        }
        //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
        if (this.promiseState === 'Pending') {
            this.callback.push({
                onResolved: function () {
                    resTmplCbk(onResolved)
                },
                onRejected: function () {
                    resTmplCbk(onRejected)
                },
            })
        }

    })

}
//添加catch函数
Promise.prototype.catch = function (onRejected) {
    this.then(undefined, onRejected)
}
// 示例,then返回值处理
const p = new Promise((resolve, reject) => {
    setTimeout(() => {// 异步调用
        resolve('OK')
    }, 1)
})
p.then().then(value => {
    console.log('OK2')

}).then(value => {
    console.log('OK3')

}).catch(reason => {
    console.log('reason')

})
//13.添加Promise.resolve函数
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            // 如果是promise，就调用then执行
            value.then((v) => {
                resolve(v)
            }, (r) => {
                reject(r)
            })
        } else {
            //把结果状态变成【成功】
            resolve(value)
        }
    })
}
//14.添加Promise.reject函数
Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason)
    })
}
//15.添加Promise.all函数
/**
 * 
 * @param {*} promises ,传入一组promise
 * 1、所有promise执行完成，统一返回结果到then里
 * 2、可以保证返回值的顺序，通过全局的回调数组实现
 */
Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
        let count = 0;//计数
        let arr = []//存结果，主要顺序
        let len = promises.length
        for (let i = 0; i < len; i++) {
            promises[i].then(v => {
                count++
                arr[i] = i
                // 等待全部返回，统一修改状态
                if (count === len) {
                    resolve(arr)
                }
            }, r => {
                reject(r)
            })
        }
    })
}
// 示例
let p1 = new Promise((resolve, reject) => {
    resolve('OK')
})
let p2 = Promise.resolve('OK1')
let p3 = Promise.resolve('OK2')
let result = Promise.all([p1, p2, p3])

// 16.添加Promise.race函数
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < len; i++) {
            promises[i].then(v => {
                resolve(arr)
            }, r => {
                reject(r)
            })
        }
    })
}
// 17.then的函数异步执行,用setTimeout(()=>{})模拟，将回调添加异步队列中
function Promise(executor) {
    // 添加属性
    this.promiseState = 'Pending' // 状态
    this.promiseResult = null // 结果
    this.callback = []// 异步回调保存
    const self = this
    // resolve函数
    function resolve(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        // 5.执行异步回调函数
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'fulfilled'// resolved
        self.promiseResult = data
        //执行异步回调函数,核心代码
        setTimeout(() => {
            self.callback.forEach(element => {
                element.onResolved(data)
            });

        })
    }
    //  reject函数
    function reject(data) {
        // 1.设置对象状态promiseState
        // 2.设置对象结果值promiseResult
        // 3.修改this的指向
        // 4.添加判断，只能在pending状态下执行。
        // 5.执行异步回调函数
        if (self.promiseState !== 'Pending') return
        self.promiseState = 'rejected'// resolved
        self.promiseResult = data
        //执行异步回调函数,核心代码
        setTimeout(() => {
            self.callback.forEach(element => {
                element.onRejected(data)
            });

        })

    }
    try {
        executor(resolve, reject) // 【同步调用】执行器函数   
    } catch (error) {
        // 修改promise的状态为reject
        reject(error)
    }
}
Promise.prototype.then = function (onResolved, onRejected) {
    // 1.根据状态，调用对应的回调函数
    // 2.传递结果值
    const self = this

    return new Promise((resolve, reject) => {
        const resTmplCbk = function (type) {//提取公共函数
            try {
                let result = type(self.promiseResult)
                // result有两种情况：1）是一个promise，2）非promise
                if (result instanceof Promise) {
                    // 如果是promise，就调用then执行
                    result.then((v) => {
                        resolve(v)
                    }, (r) => {
                        reject(r)
                    })
                } else {
                    //把结果状态变成【成功】
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        }
        if (onRejected !== 'function') {//如果没有传递，就默认,实现异常穿透
            onRejected = reason => {
                throw 'reason'
            }
        }
        if (onResolved !== 'function') {//如果没有传递，就默认,实现值穿透
            onResolved = value => value
        }

        if (this.promiseState === 'fulfilled') {
            resTmplCbk(onResolved)
        }
        if (this.promiseState === 'rejected') {
            resTmplCbk(onRejected)

        }
        //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
        if (this.promiseState === 'Pending') {
            this.callback.push({
                onResolved: function () {
                    resTmplCbk(onResolved)
                },
                onRejected: function () {
                    resTmplCbk(onRejected)
                },
            })
        }

    })

}
// 
// 示例
let p1 = new Promise((resolve, reject) => {

    resolve('OK')
    console.log(111)
})
p1.then(() => {
    console.log(222)
}).then(() => {
    console.log(333)
})
console.log(444)
// 结果：111，444，222，333

// 18.用class实现promise
class Promise {
    constructor(executor) {
        // 添加属性
        this.promiseState = 'Pending'
        this.promiseResult = null
        const self = this
        // resolve函数
        function resolve(data) {
            // 1.设置对象状态promiseState
            // 2.设置对象结果值promiseResult
            // 3.修改this的指向
            self.promiseState = 'fulfilled'// resolved
            self.promiseResult = data
        }
        //  reject函数
        function reject(data) {
            // 1.设置对象状态promiseState
            // 2.设置对象结果值promiseResult
            // 3.修改this的指向
            self.promiseState = 'rejected'// resolved
            self.promiseResult = data

        }
        executor(resolve, reject) // 【同步调用】执行器函数
    }
    then(onResolved, onRejected) {
        // 1.根据状态，调用对应的回调函数
        // 2.传递结果值
        const self = this

        return new Promise((resolve, reject) => {
            const resTmplCbk = function (type) {//提取公共函数
                try {
                    let result = type(self.promiseResult)
                    // result有两种情况：1）是一个promise，2）非promise
                    if (result instanceof Promise) {
                        // 如果是promise，就调用then执行
                        result.then((v) => {
                            resolve(v)
                        }, (r) => {
                            reject(r)
                        })
                    } else {
                        //把结果状态变成【成功】
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            if (onRejected !== 'function') {//如果没有传递，就默认,实现异常穿透
                onRejected = reason => {
                    throw 'reason'
                }
            }
            if (onResolved !== 'function') {//如果没有传递，就默认,实现值穿透
                onResolved = value => value
            }
            if (this.promiseState === 'fulfilled') {
                resTmplCbk(onResolved)
            }
            if (this.promiseState === 'rejected') {
                resTmplCbk(onRejected)

            }
            //异步不改变状态，只能暂时保存异步回调函数，在对应状态里执行回调
            if (this.promiseState === 'Pending') {
                this.callback.push({
                    onResolved: function () {
                        resTmplCbk(onResolved)
                    },
                    onRejected: function () {
                        resTmplCbk(onRejected)
                    },
                })
            }

        })
    }
    catch(onRejected) {
        this.then(undefined, onRejected)
    }
    static resolve() {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                // 如果是promise，就调用then执行
                value.then((v) => {
                    resolve(v)
                }, (r) => {
                    reject(r)
                })
            } else {
                //把结果状态变成【成功】
                resolve(result)
            }
        })
    }
    static reject() {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }
    static all(promises) {
        return new Promise((resolve, reject) => {
            let count = 0;//计数
            let arr = []//存结果，主要顺序
            let len = promises.length
            for (let i = 0; i < len; i++) {
                promises[i].then(v => {
                    count++
                    arr[i] = i
                    if (count === len) {
                        resolve(arr)
                    }
                }, r => {
                    reject(r)
                })
            }
        })
    }
    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < len; i++) {
                promises[i].then(v => {
                    resolve(arr)
                }, r => {
                    reject(r)
                })
            }
        })
    }
}

// 更详细实现参考：https://www.promisejs.org/polyfills/promise-6.1.0.js
// https://github.com/then/promise/

```

## promise A+的完整规范,完整代码

```js

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class AjPromise {
  constructor(fn) {
    this.state = PENDING;
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = value => {
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = FULFILLED;
          this.value = value;
          this.onFulfilledCallbacks.map(cb => {
            cb = cb(this.value);
          });
        }
      });
    };
    const reject = reason => {
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.map(cb => {
            cb = cb(this.reason);
          });
        }
      });
    };
    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    let newPromise;

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : reason => {
            throw reason;
          };
    if (this.state === FULFILLED) {
      return (newPromise = new AjPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    }
    if (this.state === REJECTED) {
      return (newPromise = new AjPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    }
    if (this.state === PENDING) {
      return (newPromise = new AjPromise((resolve, reject) => {
        this.onFulfilledCallbacks.push(value => {
          try {
            let x = onFulfilled(value);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(reason => {
          try {
            let x = onRejected(reason);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    }
  }
}
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    reject(new TypeError('循环引用'));
  }
  if (x instanceof AjPromise) {
    if (x.state === PENDING) {
      x.then(
        y => {
          resolvePromise(promise2, y, resolve, reject);
        },
        reason => {
          reject(reason);
        }
      );
    } else {
      x.then(resolve, reject);
    }
  } else if (x && (typeof x === 'function' || typeof x === 'object')) {
    let called = false;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

AjPromise.deferred = function() {
  let defer = {};
  defer.promise = new AjPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

module.exports = AjPromise;


```
