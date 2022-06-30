import Qs from 'qs';
// import {sentryReport} from './sentry.config';

const PING_CODE = 20;
const PONG_CODE = 21;
const MAX_CONNECT_COUNT = 20;
// 发送心跳定时器时间
const PING_INTERVAL_TIME = 10 * 1000;
// 接收心跳定时器时间
const PONG_INTERVAL_TIME = 20 * 1000;
let disconnectTimes = 0;

const heartCheck = Symbol('heartCheck');
const closeHandle = Symbol('closeHandle');
const onclose = Symbol('onclose');
const onError = Symbol('onError');
class WebSocketImpl {
    static instance = null;

    static getInstance() {
        if (!WebSocketImpl.instance) {
            WebSocketImpl.instance = new WebSocketImpl();
        }
        return WebSocketImpl.instance;
    }

    // 心跳机制的时间可以自己与后端约定
    // 定义成私有，不允许外部调用
    [heartCheck]() {
        // 防止onmessage被外层覆盖
        this.ws.addEventListener('message', ({data = {}}) => {
            const response = JSON.parse(data);
            if (response.code === 0 && response.data && response.data.businessCode === PONG_CODE) {
                // 服务器端返回pong,修改pingPong的状态
                this.pingPong = PONG_CODE;
            }
        });
        // ws的心跳机制状态值
        this.pingPong = PING_CODE;
        this.pingInterval = setInterval(() => {
            console.log('WebSocket -> this.pingInterval -> this.ws.readyState', this.ws.readyState);
            if (this.ws.readyState === 1) {
                // 检查ws为链接状态 才可发送
                this.sendData({requestType: PING_CODE});
            }
        }, PING_INTERVAL_TIME);
        this.pongInterval = setInterval(() => {
            if (this.pingPong === PING_CODE) {
                // pingPong没有改变为pong，重启webSocket
                this[closeHandle]();
            }
            // 重置为ping 若下一次PING_CODE发送失败 或者pong返回失败(pingPong不会改成pong)，将重启
            this.pingPong = PING_CODE;
        }, PONG_INTERVAL_TIME);
    }

    // webSocket并不稳定，规定只能手动关闭，否则就重连
    [closeHandle]() {
        console.log('closeHandle');
        if (this.status === 'close') {
            console.log('websocket手动关闭,或者正在连接');
        }
        else {
            console.log('重连websocket');
            disconnectTimes++;
            if (disconnectTimes > MAX_CONNECT_COUNT) {
                this.close();
                return;
            }
            // 重连
            const timer = setTimeout(() => {
                this.connect(this.data);
                clearTimeout(timer);
            }, 1000);
        }
        // 清除定时器
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = 0;
        }
        if (this.pongInterval) {
            clearInterval(this.pongInterval);
            this.pongInterval = 0;
        }
    }

    // 如果后端因为一些情况断开了ws，是可控情况下的话，会触发前端weboscket的onclose方法，我们便会重连。关闭能够实时重连
    [onclose]() {
        this.ws.onclose = data => {
            const {code, reason = '', wasClean} = data;
            console.log(`websocket 断开: ${code} ${reason} ${wasClean}`);
            if (data.code !== 1000) {
                // sentryReport('ws非正常关闭', {
                //     tags: {
                //         code,
                //         reason,
                //         wasClean
                //     }
                // });
            }
            // 监听关闭：包括手动和非手动
            this[closeHandle]();
        };
    }

    /**
     * @description: 通信发生错误时触发
     * @param {type}
     * @return:
     */
    [onError](reject) {
        this.ws.onerror = data => {
            console.log('ws报错', data);
            reject(data);
        };
    }

    // 需要抛出的实例方法:公共方法
    connect(data) {
        this.data = data;
        this.ws = new WebSocket(
            // Qs.stringify将参数以&符号拼接起来
            `${process.env.wsUrl}${data.url}?${Qs.stringify(data.query)}`
        );
        return new Promise((resolve, reject) => {
            this.ws.onopen = e => {
                console.log('连接成功', e);
                this.status = 'open';
                // this.heartCheck();
                this[heartCheck]();
                resolve(this);
                this[onError](reject);
            };
            this[onclose]();
        });
    }

    // 监听消息
    onMessage(callBack) {
        this.ws.onmessage = e => {
            if (typeof e.data === 'string') {
                const data = JSON.parse(e.data);
                callBack(data);
            }
        };
    }

    // 发送数据:音频或对象
    sendData(data = {}, type = '') {
        if (type === 'audio') {
            this.ws.send(data);
        }
        // 为对象才走这里
        else if (typeof (data) === 'object') {
            this.ws.send(JSON.stringify(data));
        }
        else {
            // 参数格式不对：此次可扩展
        }
    }

    /**
     * @description: 前端连接关闭时触发
     * @param {type}
     * @return:
     */
    close() {
        clearInterval(this.pingInterval);
        clearInterval(this.pongInterval);
        this.status = 'close';
        this.ws.close();
        console.log('已断开连接');
        // 不需要移除
        this.ws = null;
    }
}

// 保证获取的实例是单例模式：一个项目只建立一个连接
export default WebSocketImpl.getInstance();

