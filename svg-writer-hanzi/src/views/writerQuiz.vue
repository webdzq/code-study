<template>
    <div class="writer-quiz-container">
        <img
            class="bg-img"
            src="/static/assets/img/bg_writer.png"
            alt="背景图"
        >
        <img
            class="writer-quiz-cell"
            src="/static/assets/img/bg_writer_quiz.png"
            alt="田字格"
        >
        <svg
            id="character-target"
            xmlns="http://www.w3.org/2000/svg"
            @touchmove="handleTouchMove"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
        />

    </div>
</template>
<script>
// 写字题
import HanziWriter from 'hanzi-writer';
// import anime from 'animejs';
import {Howl, Howler} from 'howler';
import screenAdaptation from '../utils/screenAdaptation';
import startTipMp3 from '../../static/mp3/writer-start-tip.mp3';
import yesTipMp3 from '../../static/mp3/writer-yes-tip.mp3';
import nextTipMp3 from '../../static/mp3/writer-next-tip.mp3';
import demoMp3 from '../../static/mp3/Y05.mp3';
import nextWriterMp3 from '../../static/mp3/Y07.mp3';
// 定时器
const TIMEOUTNUM = 6000;
// let timeId = 0;
const STROKEWIDTH = 15;
// 自己调试
let MOCK = false;
// 页面从 window.readyWriter开始执行，由APP控制
export default {
    data() {
        return {
            timeId: null,
            writer: null,
            strokeNum: 0,
            totalMistakes: 0,
            characterTarget: null,
            container: null,
            panImage: null,
            printNum: 0,
            sound: null,
            popupVisible: true,
            writerNum: 0,
            strokesRemaining: 99,
            hanziOps: {},
            text: '',
            soundId: 0,
            strokeColor: '#FECE37',
            drawingColor: '#f00',
            charData: null,
            iid: null,
            playPauseAnim: null,
            autoWriterFlag: false,
            touchFlag: true,
            mockHanzi: '川',
            medians: 1,
            width: 100,
            height: 100,
            strokesAudioData: null
        };
    },
    mounted() {
        const that = this;
        // 获取写字题dom对象
        this.characterTarget = document.querySelector('#character-target');
        this.container = document.querySelector('.writer-quiz-container');
        // 自定义mock模式
        this.mockDIyMockMode(this.$route.query.m);
        // 设置横屏
        if (MOCK) {
            this.setScreenMode('horizon');
            this.mockcellSize();
        }
        // that.$utils.printDeviceVal('.tiaoshi');
        // 设置文档显示或隐藏时的动作（切入切出监听）
        this.setVisibilitychange();
        // 自定义汉字
        this.mockDiyHanzi(this.$route.query.z);
        // 初始化汉字，汉字从客户端获取
        this.getPageDataApi(text => {
            that.text = text;
            const svgRect = this.characterTarget.getBoundingClientRect();
            console.log('svgRect.width,height=', svgRect.width, svgRect.height);
            that.width = svgRect.width;
            that.height = svgRect.height;
            // 创建汉字，初始化
            that.creatHanziWriter(text);
            // 初始化测验
            that.drawInit();
        });
        // 清除h5一切干扰声音（容错流程）
        this.stopAudio();
        // Howl.mobileAutoEnable = false;
        // 罗盘上报，埋点数据

        // 监听屏幕尺寸变化
        this.$utils.initOnSizeLinster(() => {
            // that.$utils.printDeviceVal('.tiaoshi');
        });
        _czc.push(['_trackEvent', 'writerQuiz', 'show', '', 1, '']);
    },
    destroyed() {
        // 页面销毁时的动作，清除定时器，清除一切音频
        console.log('destroyed');
        this.delNextTip();
        Howler.unload();
    },
    methods: {
        mockDIyMockMode(val) {
            // 自定义mock模式
            if (val === '1') {
                MOCK = true;
            }
            console.log('mockDIyMockMode,val,mock=', val, MOCK);
        },
        mockDiyHanzi(char) {
            // 自定义显示的汉字
            console.log('mockDiyHanzi,char=', char, this.$utils.quizHanziFormat(char));
            if (this.$utils.quizHanziFormat(char)) {
                this.mockHanzi = char;
            }
        },
        mockcellSize() {
            // mock修改格子和汉字大小
            const cell = document.querySelector('.writer-quiz-cell');
            cell.style.width = '11.87rem';
            cell.style.height = '8.75rem';
            this.characterTarget.style.width = '8.5rem';
            this.characterTarget.style.height = '7.5rem';
        },
        drawBrushImg(vcount) {
            // const g = document.querySelector('this.characterTarget ');
            try {
                const that = this;
                const count = vcount || 0;
                // const dom= document.querySelector('#character-target');
                // const dg= dom.childNodes[1];
                // const path = dg.childNodes[0].childNodes[1];
                const g = this.characterTarget.childNodes[1];
                console.log('drawBrushImg=', this.characterTarget.childNodes, g);
                if (!g) {
                    return;
                }
                const path = g.childNodes[0].childNodes[count];
                const plen = path.getTotalLength();
                const point0 = path.getPointAtLength(2);
                console.log('path...plen,xarr,yarr=', plen, point0, path);
                const xmlns = 'http://www.w3.org/2000/svg';
                // const trf = 'translate(-166,140)';
                const sg = document.createElementNS(xmlns, 'g');
                sg.setAttributeNS(null, 'transform', g.getAttribute('transform'));
                sg.setAttributeNS(null, 'id', 'brushIg');
                this.characterTarget.appendChild(sg);
                const svgImg = document.createElementNS(xmlns, 'image');
                svgImg.setAttributeNS(null, 'x', point0.x);
                svgImg.setAttributeNS(null, 'y', point0.y);
                svgImg.setAttributeNS(null, 'width', '166px');
                svgImg.setAttributeNS(null, 'height', '140px');
                svgImg.setAttributeNS(null, 'background', 'red');
                svgImg.setAttributeNS(null, 'id', 'brushImg');
                svgImg.setAttributeNS(null, 'stroke-linejoin', 'miter');
                svgImg.setAttributeNS(null, 'transform', 'translate(0,-120)');
                // svgImg.setAttributeNS(null, 'transform-origin', '166 140');
                svgImg.href.baseVal = '/static/assets/img/pan.png';
                sg.appendChild(svgImg);
                // 启动循环
                this.controlBrushFlag = true;
                let index = 80;
                const step = 5;
                const brushLoop = function () {
                    if (index > plen) {
                        // 第一轮结束
                        svgImg.style.opacity = 0;
                        if (index > plen + 120) {
                            index = 80;
                        }
                    }
                    else {
                        const point = path.getPointAtLength(index);
                        console.log('index=', index);
                        svgImg.style.opacity = 1;
                        svgImg.setAttributeNS(null, 'x', point.x);
                        svgImg.setAttributeNS(null, 'y', point.y);
                    }
                    index += step;
                    if (that.controlBrushFlag) {
                        window.requestAnimationFrame(brushLoop);
                    }
                };
                // 启动笔画循环
                brushLoop();
            }
            catch (error) {

            }
        },
        clearBrushImg() {
            // 清除笔画提醒定时器及dom
            const svgg = document.querySelector('#brushIg');
            console.log('clearPan...', svgg);
            // const g = this.characterTarget.childNodes[2];
            try {
                // window.clearInterval(this.timeId);
                // 清除笔画循环
                this.controlBrushFlag = false;
                if (svgg) {
                    svgg.style.display = 'none';
                    // svgg.setAttributeNS(null, 'display', 'none');
                    svgg.innerHTML = '';
                    this.characterTarget.removeChild(svgg);
                }
            }
            catch (error) {

            }
        },
        initTip(count) {
            // 图片笔画提示动画创建
            console.log('count=', this.charData.medians[count]);
            // 获取笔画提示点数组
            const mediansArr = this.charData.medians[count];
            const elem = mediansArr[0];
            // 获取svg的宽和高
            const {width, height} = this.characterTarget.getBoundingClientRect();
            // 获取svg的缩放和动画属性值
            const {scale, transform} = HanziWriter.getScalingTransform(width, height);
            console.log('mediansArr=', elem[0], elem[1]);
            const xmlns = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(xmlns, 'g');
            g.setAttributeNS(null, 'transform', transform);
            g.setAttributeNS(null, 'id', 'svgPang');
            this.characterTarget.appendChild(g);
            // 创建一个图片
            const svgImg = document.createElementNS(xmlns, 'image');
            // 设置图片的初始属性，位置和大小
            svgImg.setAttributeNS(null, 'x', elem[0] - 83 * (1 - scale));
            svgImg.setAttributeNS(null, 'y', elem[1] - 70 * (1 - scale));
            svgImg.setAttributeNS(null, 'width', '166px');
            svgImg.setAttributeNS(null, 'height', '140px');
            svgImg.setAttributeNS(null, 'id', 'svgPan');
            svgImg.href.baseVal = '/static/assets/img/pan.png';
            // 创建提示笔图片对象，设置属性
            g.appendChild(svgImg);
            // 做一个按照给定中心点运动的动画
            return this.movePan(count);
        },
        clearPan() {
            // 清除笔画提醒定时器及dom
            const svgg = document.querySelector('#svgPang');
            console.log('clearPan...', svgg);
            try {
                if (svgg) {
                    svgg.innerHTML = '';
                    this.characterTarget.removeChild(svgg);
                }
            }
            catch (error) {

            }
        },
        movePan(count) {
            // 笔画提示动画
            const domSvgPan = document.querySelector('#svgPan');
            console.log('domSvgPan=', domSvgPan);
            console.log('count=', this.charData.medians[count]);
            const {width, height} = this.characterTarget.getBoundingClientRect();
            const {scale} = HanziWriter.getScalingTransform(width, height);
            const mediansArr = this.charData.medians[count];
            let index = 0;
            let initTime = new Date().getTime();
            this.timeId = window.setInterval(() => {
                const curTime = new Date().getTime();
                // 走完一趟前
                console.log('index===', index);
                if (index > mediansArr.length - 1) {
                    // 走完一趟后// 等待TIMEOUTNUM时间间隔
                    if (curTime - initTime > TIMEOUTNUM) {
                        domSvgPan.setAttributeNS(null, 'display', 'block');
                        initTime = new Date().getTime();
                        index = index > mediansArr.length - 1 ? 0 : index;
                        const elem = mediansArr[index];
                        domSvgPan.setAttribute('x', elem[0] - 83 * (1 - scale));
                        domSvgPan.setAttribute('y', elem[1] - 70 * (1 - scale));
                        index++;
                    }
                    else {
                        // 隐藏
                        domSvgPan.setAttributeNS(null, 'display', 'none');
                    }
                }
                else {
                    index = index > mediansArr.length - 1 ? 0 : index;
                    const elem = mediansArr[index];
                    domSvgPan.setAttribute('x', elem[0] - 83 * (1 - scale));
                    domSvgPan.setAttribute('y', elem[1] - 70 * (1 - scale));
                    index++;
                }
            }, 200);
            return this.timeId;
        },
        stopAudio() {
            // h5清除
            // Howler.unload();
            // 客户端清除
            const that = this;
            window.stopSound = () => {
                that.delNextTip();
            };
        },
        initAudio() {
            // 初始化一个音频-弃用
            this.sound = new Howl({
                src: [startTipMp3, yesTipMp3, nextTipMp3, demoMp3, nextWriterMp3],
                autoplay: false,
                mute: false,
                autoUnlock: true,
                onend() {
                    console.log('Finished!');
                }
            });
        },
        playAudio(src, cbk) {
            // 初始化并播放音频，播放有兼容性问题，不能用来控制流程节奏
            // ioswebview已经优化-弃用
            // if (this.$utils.isIOS() && !this.touchFlag) {
            // // ios下，不触摸不允许播放语音,ioswebview已经优化-弃用
            //     return false;
            // }
            const validSrc = src;
            if ('' === validSrc) {
                return false;
            }

            // 先清除已有音频
            // Howler.unload();
            this.sound = new Howl({
                src: [validSrc],
                // autoplay: true,
                mute: false,
                autoUnlock: true,
                loop: false,
                onend() {
                    // 播放完成回调
                    console.log('Finished!');
                    cbk && cbk();
                },
                onplayerror() {
                    this.sound.once('unlock', () => {
                        this.sound.play();
                    });
                }
            });
            this.sound.play();
            console.log('this.sound=', src);
            this.sound.once('play', () => {
                console.log('once play Finished!');
            });
        },
        nativeInterInitHanZi(initCbk, ecbk) {
            // 与客户端交互代码，初始化汉字
            if (this.$utils.isIOS()) {
                try {
                    window.webkit.messageHandlers.getData.postMessage({
                        from: 'h5',
                        score: '3'
                    });
                    window.recieveData = res => {
                        console.log('获取页面数据', res);
                        initCbk && initCbk(res);
                    };
                }
                catch (error) {
                    // mock自测流程
                    ecbk && ecbk();
                }
            }
            else if (this.$utils.isAndroid()) {
                try {
                    console.log('getData...start');
                    window.maodou.getData();
                    console.log('getData...end');
                    // APP：触发页面流程
                    window.recieveData = res => {
                        console.log('recieveData', res);
                        initCbk && initCbk(res);
                    };
                }
                catch (error) {
                    // mock自测流程
                    ecbk && ecbk();
                }
            }
            else {
                // pc
                console.log('recieveData-pc');
            }
        },
        getPageDataApi(cbk) {
            // APP:从APP中获取数据
            const that = this;
            if (MOCK) {
                // mock数据,自测
                console.log('wo');
                cbk && cbk(that.mockHanzi);
            }
            this.nativeInterInitHanZi(res => {
                const text = res;
                cbk && cbk(text);
                // 罗盘上报

            }, () => {
                // cbk && cbk('我');
            });
        },
        nativeInterSetComp(ioscbk, andriodcbk, errorcbk) {
            // 客户端结算页调用
            if (this.$utils.isIOS()) {
                try {
                    window.webkit.messageHandlers.getResult.postMessage({
                        from: 'h5'
                    });
                    window.settlementComplete = res => {
                        // e，true，重新写；false，不写了。
                        ioscbk && ioscbk(res);
                        console.log('结算结束', res);

                    };
                }
                catch (e) {
                    errorcbk && errorcbk();
                }
            }
            else if (this.$utils.isAndroid()) {
                try {
                    // 调用结算页
                    window.maodou.settlementComplete('h5');
                    andriodcbk && andriodcbk();
                }
                catch (error) {
                    errorcbk && errorcbk();
                }
            }
        },
        setWriterCompTip() {
            // APP:调用APP的结算页
            const that = this;
            this.nativeInterSetComp(res => {
                // ios
                if (res) {
                    // 重新测验
                    that.repeatWriter();
                }
            }, () => {
                // andriod
            }, () => {
                // errror
            });
        },
        repeatWriter() {
            // 重新写一遍，写第二次
            const that = this;
            //  add mp3:再写一次吧
            // this.testAppCall('repeatWriter...start..');
            this.playAudio(nextWriterMp3);
            window.setTimeout(() => {
                // that.testAppCall('repeatWriter...end');
                // 重新初始化页面参数
                that.characterTarget.innerHTML = '';
                // console.log('repeatWriter...', that.characterTarget);
                // 逻辑控制变量重置
                that.totalMistakes = 0;
                that.strokesRemaining = 99;
                that.strokeNum = 0;
                that.printNum = 0;
                // 重新开始绘制
                that.creatHanziWriter(that.text);
                that.initquiz();
                that.autoWriterFlag = true;
                // 下一笔提醒
                that.timeOutNextTip();
            }, 3000);
        },
        initquiz() {
            // 初始化测验
            this.writer.quiz();
            this.writer.hideCharacter();
        },
        setScreenMode(type) {
            // vertical -横屏模式
            screenAdaptation(type => type);
        },
        creatHanziWriter(text) {
            const that = this;
            // 初始化汉字
            try {
                // const svgRect = this.characterTarget.getBoundingClientRect();
                // console.log('svgRect.width,height=', svgRect.width, svgRect.height);
                // 清除定时器和音频
                this.delNextTip();
                // Howler.unload();
                // 随机一个画笔颜色
                this.strokeColor = this.setStrokeColor();
                // 初始化汉字参数
                this.hanziOps = {
                    width: this.width,
                    height: this.height,
                    strokeColor: this.strokeColor,
                    drawingColor: this.strokeColor,
                    drawingWidth: 60,
                    showCharacter: true,
                    // padding: 5,
                    showHintAfterMisses: 1,
                    strokeAnimationSpeed: 0.2,
                    strokeHighlightSpeed: 0.2,
                    highlightColor: this.strokeColor,
                    highlightOnComplete: false,
                    leniency: 0.8,
                    onCorrectStroke: this.printStrokePoints,
                    onMistake: this.printStrokePoints,
                    onComplete: this.writerComplete,
                    charDataLoader: this.downHanziData,
                    // renderer: 'canvas',
                    onLoadCharDataSuccess(data) {
                        console.log('data loading Success!', data);
                        that.medians = data.medians.length - 1;
                        if (MOCK) {
                            // that.initTip(0);
                        }
                    },
                    onLoadCharDataError(reason) {
                        console.log('Oh No! Something went wrong :(');
                    }
                };
                this.writer = HanziWriter.create('character-target', text, this.hanziOps);
            }
            catch (error) {
                console.log('this.writer', this.writer);
                if (this.$utils.isIOS()) {
                    // window.showLog('web=creatHanziWriter...end', error);
                }
            }
        },
        animateCharacte(callback) {
            // 自动绘制字体
            const that = this;
            // that.playAudio('');
            console.log('that.writer', that.writer);
            // 清除定时器和音频干扰
            this.delNextTip();
            that.writer.animateCharacter({
                onComplete() {
                    that.autoWriterFlag = true;
                    that.initquiz();
                    // add mp3:你也来写一写吧
                    if (MOCK) {
                        that.playAudio(startTipMp3);
                    }
                    else if (that.$utils.isIOS()) {
                        // ios 播放语音
                        window.webkit.messageHandlers.playWriteMusic.postMessage({
                            from: 'h5'
                        });
                    }
                    else {
                        that.playAudio(startTipMp3);
                    }
                    // 下一笔提醒
                    that.timeOutNextTip();
                    callback && callback();
                }
            });
        },
        drawInit(callback) {
            // 初始化绘制流程
            const that = this;

            if (MOCK) {
                // mock 自测
                that.playAudio(demoMp3);
                // this.$utils.sleep(10000);
                that.animateCharacte(callback);
                return;
            }
            if (this.$utils.isAndroid() || this.$utils.isIOS()) {
                // APP控制写字初始化
                window.readyWriter = () => {
                    // add mp3:我们先来看看这个字怎么写吧
                    // ios的自己播放
                    if (that.$utils.isAndroid()) {
                        that.playAudio(demoMp3);
                    }
                    // 自动写一次
                    that.animateCharacte(callback);
                };
            }
        },
        printStrokePoints(charData) {
            // 每笔画绘制后的回调函数
            console.log('onCorrectStroke,data=', charData);
            const {drawnPath, totalMistakes, strokeNum, strokesRemaining} = charData;
            // 判断是否绘制正确，正确就显示笔迹
            console.log('totalMistakes=', totalMistakes, this.totalMistakes);
            if (totalMistakes === this.totalMistakes) {
                // 播放正确语音-弃用
                // this.playAudio(yesTipMp3);
                this.printNum++;
                this.strokesRemaining = strokesRemaining;
                // 记录画到第几划了
                this.strokeNum = strokeNum;
                this.appendToContainer(drawnPath);
            }
            else {
                this.totalMistakes++;
                // 播放错误语音
                // this.playAudio('');
            }
        },
        appendToContainer(drawnPath) {
            // 绘制路径到svg上，显示用户鼠标路径
            console.log('appendToContainer...', drawnPath);
            const xmlns = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(xmlns, 'g');
            const path = document.createElementNS(xmlns, 'path');
            const pathstr = drawnPath.pathString;
            // const snum = this.strokeNum === 0 ? 0 : this.strokeNum - 1;
            // const strokesPath = this.charData.strokes[snum];
            // g.setAttributeNS(null, 'transform', transform);
            g.setAttributeNS(null, 'id', 'svgPaintPath');
            // path.setAttributeNS(null, 'd', strokesPath);
            // console.log('appendToContainer...strokesPath=', strokesPath);
            // console.log('appendToContainer...pathstr=', pathstr);
            path.setAttributeNS(null, 'd', pathstr);
            path.setAttributeNS(null, 'from', 'maodou');
            path.setAttributeNS(null, 'class', 'maodou');
            // fill一定要为none，否则路径一整片
            path.style.fill = 'none';
            // path.style.stroke = this.setStrokeColor(this.strokeNum);
            path.style.stroke = this.strokeColor;
            path.style.strokeLinecap = 'round';
            path.style.strokeWidth = STROKEWIDTH;
            // console.log('appendToContainer==characterTarget', this.characterTarget);
            this.characterTarget.appendChild(g);
            // this.characterTarget.appendChild(path);
            g.appendChild(path);
            // this.timeOutNextTip();
        },
        setStrokeColor() {
            // 彩色字,初始化笔触颜色
            const colorArr = ['#FECE37', '#4BDDEC', '#51EEA9', '#CD91D2', '#F97F14'];
            const len = colorArr.length - 1;
            const color = Math.floor(Math.random() * len);
            return colorArr[color];
        },
        handleTouchStart(evt) {
            // 触摸事件
            console.log('handleTouchStart...', evt);
            // this.displayShowOrHide(this.panImage, 'block');
            this.touchFlag = true;
            let count = this.printNum === 0 ? this.strokeNum : this.strokeNum + 1;
            // 笔画总数
            // const len = that.medians.length - 1;
            if (count > this.medians) {
                count = this.medians;
            }
            if (this.autoWriterFlag) {
                this.strokeAudioTip(count);
                this.delNextTip();
            }
        },
        handleTouchMove(evt) {
            // 触摸事件-弃用
            // console.log('handleTouchMove...', evt);
            // this.delNextTip();
            // const item = {
            //     x: 0,
            //     y: 0
            // };
            // if (evt.targetTouches) {
            //     item.x = evt.targetTouches[0].pageX;
            //     item.y = evt.targetTouches[0].pageY;
            // }
            // else {
            //     item.x = evt.pageX;
            //     item.y = evt.pageY;
            // }
            // console.log('handleTouchMove...', item.x, item.y);
            // this.setLeftAndTopVal(this.panImage, item.x, item.y);
        },
        handleTouchEnd(evt) {
            // 触摸事件-弃用
            // console.log('handleTouchEnd...', evt);
            // this.displayShowOrHide(this.panImage, 'none');
            // this.delNextTip();
            if (this.autoWriterFlag) {
                this.timeOutNextTip();
            }
        },
        panImageInit() {
            // 弃用
            this.panImage = document.querySelector('.pan-image');
            this.displayShowOrHide(this.panImage, 'none');
        },
        displayShowOrHide(domObj, disStr) {
            // 弃用
            // domObj.style.display = disStr;
        },
        setLeftAndTopVal(domObj, left = 0, top = 0) {
            // 弃用-div旋转90度后，鼠标的x/y需要互换，top方向移动需要用容器-获取值
            const {width} = this.container.getBoundingClientRect();
            const y = top;
            const x = width - left;
            domObj.style.left = `${y}px`;
            domObj.style.top = `${x}px`;
        },
        mockAudio(val) {
            // 弃用
            // if (val === '1') {
            //     this.audio = p3;
            // }
            // else if (val === '2') {
            //     this.audio = yesTipMp3;
            // }
        },
        strokeAudioTip(count) {
            // 按照笔画播放音频
            const len = this.strokesAudioData.length - 1;
            const num = count > len ? 0 : count;
            const mp3 = this.strokesAudioData[num];
            this.playAudio(mp3);
        },
        brushImgRemind() {
            // 笔画动画提醒
            // 测验完剩余的笔画数，=0表示已经写完了
            if (this.strokesRemaining === 0) {
                // this.delNextTip();
                return false;
            }
            let count = this.printNum === 0 ? this.strokeNum : this.strokeNum + 1;
            // 笔画总数
            // const len = that.medians.length - 1;
            if (count > this.medians) {
                count = this.medians;
            }
            this.drawBrushImg(count);
        },
        timeOutNextTip() {
            // 下一笔提醒
            console.log('timeOutNextTip...');
            // 3s未写字提醒
            const that = this;
            // const f = arguments.callee;
            // 清除各种干扰
            this.delNextTip();
            // 写字题未自动绘制完成不允许调用
            if (!this.autoWriterFlag) {
                return;
            }
            // 测验完剩余的笔画数，=0表示已经写完了
            if (that.strokesRemaining === 0) {
                // this.delNextTip();
                return false;
            }
            // 定时器时独立流程，有时驻留在内存里，导致清除不彻底
            window.clearTimeout(this.timeId);
            this.timeId = window.setTimeout(() => {
                that.brushImgRemind();
            }, TIMEOUTNUM);

            /**
            this.timeId = window.setInterval(() => {
                // 绘制完成了
                console.log('setTimeout-that.printNum--', that.printNum);
                // 测验完剩余的笔画数，=0表示已经写完了
                if (that.strokesRemaining === 0) {
                    // this.delNextTip();
                    return false;
                }
                // const count = that.printNum === 0 ? that.strokeNum : that.strokeNum + 1;
                let count = that.printNum === 0 ? that.strokeNum : that.strokeNum + 1;
                // 笔画总数
                const len = that.charData.medians.length - 1;
                if (count > len) {
                    count = len;
                }
                //  add mp3:动动小手写一写吧
                that.playAudio(nextTipMp3);
                // 提示下一笔高亮;
                that.writer.highlightStroke(count, {
                    onComplete(data) {
                    }
                });
            }, TIMEOUTNUM);
            */
        },
        tipTask() {
            // 弃用
            // this.timeOutNextTip();
        },
        delNextTip() {
            // 解决定时器清除不干净的问题，音频重音，时大时小问题
            console.log('delNextTip...', this.timeId);
            // Howler.unload(); 这个会导致第一个音频无声音
            const i = this.timeId === null ? 0 : Math.floor(this.timeId / 2);
            console.log('delNextTip...i=', i);
            const end = this.timeId * 2;
            this.clearBrushImg();
            for (let index = i; index < end; index++) {
                window.clearInterval(index);
            }
        },
        writerComplete(data) {
            console.log('writerComplete=...');
            // 绘制完成,结束下一笔提醒，魔法石增加、播放完成提示音,结算页是lottle动效
            this.delNextTip();
            if (this.writerNum === 0) {
                // 再写一次
                this.writerNum++;
                this.autoWriterFlag = false;
                this.repeatWriter();
            }
            else {
                // 写完2次后调APP结算
                this.writerNum = 0;
                this.setWriterCompTip();
            }
        },
        testAppCall(val) {
            // 与APP调试时使用
            // document.querySelector('#pageDate').innerHTML = val;
        },
        setVisibilitychange() {
            const that = this;
            const tag = this.$utils.getHiddenProp();
            const visit = this.$utils.getVisibilityState();
            try {
                const evtname = `${tag.replace(/[H|h]idden/, '')}visibilitychange`;
                document.addEventListener(evtname, () => {
                    console.log('tag=', document[tag], document[visit], this.sound);
                    // Howler.unload();
                    if (document[tag]) {
                        // 切出时调用
                        that.delNextTip();
                    }
                    else {
                        // 切入时调用
                        console.log('setVisibilitychange...1');
                        that.timeOutNextTip();

                    }
                });
            }
            catch (error) {
            }
        },
        downHanziData(char, onComplete) {
            // 获取汉字字体数据
            const chars = decodeURIComponent(char);
            const that = this;
            this.getStrokesAudioData(chars);
            console.log(char, chars);
            this.$http.get(`${this.$Api.getHanziData}${chars}.json`).then(charData => {
                that.charData = charData;
                console.log('that.charData =', that.charData);
                onComplete(charData);
            });
        },
        getStrokesAudioData(char, onComplete) {
            // 获取汉字笔画对应的音频
            const that = this;
            const chars = decodeURIComponent(char);
            console.log(char, chars);
            this.$http.get(`${this.$Api.getstrokeAudioData}?hanzi=${chars}`).then(res => {
                console.log('strokesAudioData =', res.data);
                if (res.code === '0') {
                    that.strokesAudioData = res.data;
                    console.log('that.strokesAudioData=', that.strokesAudioData);
                    onComplete && onComplete(res.data);
                }
                else {
                    console.log('加载异常……');
                }

            });
        }
    }
};
</script>
<style lang="less" scoped>
.writer-quiz-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    #pageDate {
        transform: translateZ(111px);
    }
    .bg-img {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: -1000;
        transform: translateZ(1px);
    }
    .return-btn {
        position: absolute;
        left: 0.4rem;
        top: 0.27rem;
        width: 1.12rem;
        height: 1.12rem;
        z-index: -999;
        transform: translateZ(2px);
    }
    .rock-cell {
        position: absolute;
        top: 0.27rem;
        right: 0.27rem;
        width: 2rem;
        height: 0.67rem;
        border: 1px solid;
        border-radius: 1rem;
        background: #794824;
        display: flex;
        .rock-icon {
            flex: 1;
            width: 0.51rem;
            margin-left: 0.21rem;
            margin-top: 0.03rem;
            height: 0.61rem;
            background: url(/static/assets/img/writer_rock.png) no-repeat;
            background-position: center;
        }
        .rock-num {
            flex: 1;
            font-size: 0.5rem;
            width: 0.72rem;
            height: 0.37rem;
            font-size: 0.45rem;
            font-family: Microsoft YaHei;
            font-weight: 400;
            color: #fff;
            margin-top: 0.15rem;
            margin-right: 0.37rem;
        }
    }
    .writer-quiz-cell {
        position: absolute;
        // top: 0.2rem;
        // bottom: 0.79rem;

        // left: 2.96rem;
        // right:2.96rem;
        width: 8.5rem;
        height: 6.5rem;
        // height: 8.75rem;
        // border:1px solid red;
        z-index: -1;
        zoom: 1;
        left: 50%;
        transform: translate(-50%) translateZ(3px);
        // border:1px solid red;
    }
    #character-target {
        position: absolute;
        // top: 0.8rem;
        // top: 1.6rem;
        // bottom: 2.39rem;
        width: 7.4rem;
        height: 5.4rem;
        // width: 6.59rem;
        // height: 6.51rem;
        z-index: 11;
        zoom: 1;
        left: 50%;
        transform: translate(-50%) translateZ(111px);
        // border:1px solid blue;
    }
    .pan-image {
        display: none;
        position: absolute;
        width: 2.22rem;
        height: 100%;
        z-index: 222;
        background-image: url(/static/assets/img/pan.png);
        background-repeat: no-repeat;
        transform: translate(0, -30px) scale(0.5, 0.5) translateZ(222px);
        transform-origin: left top;
    }
}

@media (device-height:568px) and (-webkit-min-device-pixel-ratio:2){
    /* 兼容iphone5 */
    .writer-quiz-container {
        .writer-quiz-cell {
            left:50%;
            top: 50%;
            margin-top: -3.1rem;
            height: 5.5rem;
        }
        #character-target {
            left:50%;
            top:50%;
            margin-top: -2.75rem;
            height: 5rem;
        }
    }
}
@media  (max-height: 768px) and (-webkit-min-device-pixel-ratio:2) {
    /* 兼容ipad air 2  justify-content 有兼容性问题*/
    .writer-quiz-container {
        // justify-content: flex-start;
        .writer-quiz-cell {
            left:50%;
            top: 50%;
            margin-top: -4.1rem;
            height: 6.5rem;
        }
        #character-target {
            left:50%;
            top:50%;
            margin-top: -3.35rem;
            height: 5.4rem;
        }
    }
}
</style>
