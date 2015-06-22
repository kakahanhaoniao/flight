function Flight() {}
Flight.prototype = {
    constructor: Flight,
    init: function(obj, startBtn, scoreBox, pauseBtn, replayBox, box, continueBox) {
        this.ctx = obj.getContext('2d');
        this.width = obj.width;
        this.height = obj.height;
        this.bgImg = this.loadImg('img/bg.jpg'); //背景图
        this.plain1 = this.loadImg('img/plain1.png'); //敌机1
        this.plain2 = this.loadImg('img/plain2.png'); //敌机2
        this.plain3 = this.loadImg('img/plain3.png'); //敌机3
        this.myplain = this.loadImg('img/me.png'); //自己的飞机
        this.logo = this.loadImg('img/logo.png'); //logo图
        this.loadimg = this.loadImg('img/loading.png'); //飞机进入加载图
        this.bulletImg = this.loadImg('img/cartridge.png'); //子弹图
        // this.bgImg.top背景图的顶部位移，this.over游戏是否结束，this.lastTime游戏持续时间
        this.bgImg.top = this.lastTime = this.over = 0;
        this.temNull = this.timer = this.me = null;
        this.loadimg.left = 0;
        this.speed = 3;
        this.bulletSpeed = 10;
        this.plain = this.bullets = [];
        this.myPower = 500; //自己飞机的子弹的能量
        this.startBtn = startBtn; //开始游戏按钮
        this.replayBox = replayBox;
        this.scoreBox = scoreBox;
        this.pauseBtn = pauseBtn;
        this.continueBox = continueBox;
        this.box = box;
        this.drawBg();
        this.loadingloop(); //游戏开始动画
    },
    // 画背景
    drawBg: function() {
        this.ctx.drawImage(this.bgImg, 0, this.bgImg.top, this.width, this.height);
        this.ctx.drawImage(this.bgImg, 0, this.bgImg.top - this.height, this.width, this.height);
    },
    // 页面加载动画
    loadingloop: function() {
        var _this = this;
        this.loading();
        if (this.loadimg.left < 300) {
            // 飞机加载动画
            this.timer = setTimeout(function() {
                _this.loadingloop.call(_this);
            }, 1000 / 60);
        } else {
            // logo加载
            this.ctx.drawImage(this.logo, 50, 150, 300, 70);
            this.startBtn.style.display = 'block';
            this.startBtn.onclick = function() {
                this.style.cssText = '';
                _this.startPlay();
            }
        }
    },
    // 加载页面飞机加载
    loading: function() {
        var _this = this;
        this.loadimg.left += 8;
        this.drawBg();
        this.ctx.drawImage(this.loadimg, this.loadimg.left - 200, 250);
    },
    // 图片预加载
    loadImg: function(url) {
        var img = new Image();
        img.src = url;
        img.onload = function() {}
        return img;
    },
    // 开始游戏
    startPlay: function() {
        var _this = this;
        this.scoreBox.style.display = this.pauseBtn.style.display = 'block';
        this.replayBox.style.display = this.continueBox.style.display = 'none';
        // 初始化数据
        this.plain = [];
        this.bullets = [];
        this.bgImg.top = 0;
        this.score = 0;
        this.lastTime = 0;
        this.speed = 3;
        // 创建自己的飞机
        this.me = this.createFly(0);
        // 鼠标移动事件修改飞机的位置
        document.addEventListener('mousemove', function(ev) {
            _this.move.call(_this, ev);
        }, false);
        // 暂停
        this.pauseBtn.onclick = function() {
            _this.pause.call(_this);
        }
        this.loop();
    },
    // 定时器
    loop: function() {
        var _this = this;
        // 设置背景移动
        this.drawBg();
        this.bgImg.top++;
        if (this.bgImg.top > this.height) {
            this.bgImg.top = 0;
        }
        // 创建子弹
        if (this.bgImg.top % 5 == 0) {
            this.createBullet();
        }
        this.lastTime += 30;
        // 定时创建敌机
        if (this.lastTime % 2400 == 0) {
            this.createFly(1);
        } else if (this.lastTime % 5700 == 0) {
            this.createFly(2);
        } else if (this.lastTime % 20100 == 0) {
            this.createFly(3);
        }
        // 限制飞机速度
        if (this.lastTime % 18000 == 0) {
            this.speed > 7 ? this.speed = 7 : this.speed += 0.5
        }
        // 改变位置（敌机）
        this.changeAllPlainPosition(this.plain);
        // 改变自己的位置
        this.changePosition(this.me);
        // 改变子弹位置            
        this.changeAllPlainPosition(this.bullets);
        // 判断敌机和子弹的位置
        this.checkIsOver();
        // 分数变化
        this.scoreBox.innerHTML = this.score;
        // this.over 为1 游戏结束，否则继续
        if (this.over && this.me.picNum == this.me.picLun - 1) {
            this.replayBox.children[1].innerHTML = this.score;
            this.replayBox.style.display = 'block';
            this.replayBox.children[2].onclick = function() {
                _this.startPlay.call(_this);
            }
        } else {
            this.timer = setTimeout(function() {
                _this.loop.call(_this);
            }, 30);
        }

    },
    // 暂停
    pause: function() {
        var _this = this;
        clearTimeout(this.timer);
        this.continueBox.style.display = 'block';
        this.continueBox.children[0].onclick = function() {
            _this.continueBox.style.display = 'none';
            _this.loop.call(_this);
        }
        this.continueBox.children[1].onclick = function() {
            _this.startPlay.call(_this);
        }
    },
    // 改变敌机/子弹位置（同时判断 是否显示即被消除）
    changeAllPlainPosition: function(aobj) {
        for (var i = 0; i < aobj.length; i++) {
            //type 为1是子弹
            aobj[i].type ? aobj[i].y -= this.bulletSpeed : aobj[i].y += this.speed * aobj[i].aSpeed;
            if (aobj[i].type ? (aobj[i].y < 0) : (aobj[i].y > (this.height + aobj[i].height))) {
                aobj[i] = this.temNull;
                aobj.splice(i, 1);
                i--;
            } else if (!aobj[i].type && aobj[i].picNum > aobj[i].picLun) {
                // 修正picNum 大于picLun的飞机存在的 bug
                aobj.splice(i, 1);
                i--;
            } else {
                this.changePosition(aobj[i], i);
            }
        }
    },
    /*    
     * 创建飞机
     * flyType:飞机类型 1=>敌机1 ，2=>敌机2 , 3=>敌机3  默认 =>自己
     */
    createFly: function(flyType) {
        var create = new Object();
        switch (flyType) {
            case 1:
                create.width = 24.5;
                create.height = 17.5;
                create.picLun = 4; //飞机多少帧
                create.power = 1000; //飞机能量
                create.img = this.plain1;
                break;
            case 2:
                create.width = 34.5;
                create.height = 46;
                create.picLun = 5;
                create.power = 5000;
                create.img = this.plain2;
                break;
            case 3:
                create.width = 82.5;
                create.height = 128;
                create.picLun = 7;
                create.power = 10000;
                create.img = this.plain3;
                break;
            default:
                create.width = 49;
                create.height = 61;
                create.picLun = 5;
                create.img = this.myplain;
        }
        // 被打击的能量
        create.hit = 0;
        // 是否死亡
        create.over = 0;
        // 加速度
        create.aSpeed = 0.7 + Math.random() * 0.5;
        // 所在图像帧
        create.picNum = 0;
        if (flyType >= 1 && flyType <= 3) {
            this.plain.push(create);
            create.x = Math.random() * (this.width - create.width);
            create.y = -create.height;
        } else {
            create.x = (this.width - create.width) / 2;
            create.y = this.height - create.height;
        }
        return create;
    },
    // 修改单个对象的位置（飞机和子弹）
    changePosition: function(obj, index) {
        if (obj.type) {
            this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
        } else {
            if (obj.over) {
                obj.picNum++;
                if (obj.picNum > obj.picLun && obj != this.me) {
                    obj = this.temNull;
                    index ? this.plain.splice(index, 1) : null;
                    return;
                }
            }
            this.ctx.drawImage(obj.img, obj.picNum * obj.width * 2, 0, obj.width * 2, obj.height * 2, obj.x, obj.y, obj.width, obj.height);
        }
    },
    /*
     *判断子弹或者飞机 是否击中 或者被击中
     */
    checkIsOver: function() {
        var small, big;
        for (var m = 0; m < this.plain.length; m++) {
            //Todo 判断敌机是否与自己的飞机的接触情况(根据大小判断)
            if (!(this.me.x + this.me.width < this.plain[m].x || this.me.x > this.plain[m].x + this.plain[m].width || this.me.y + this.me.height < this.plain[m].y || this.me.y > this.plain[m].y + this.plain[m].height - 10)) {
                this.over = 1;
                this.me.over = 1;
                this.plain[m].over = 1;
                this.plain[m].hit = this.plain[m].power;
                return;
            }

            // 敌机的over属性如果为1说明以及消灭
            if (this.plain[m].over == 1) {
                continue;
            }
            // 判断敌机是否与子弹接触
            for (var i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].x > this.plain[m].x && this.bullets[i].x < this.plain[m].x + this.plain[m].width && this.bullets[i].y > this.plain[m].y && this.bullets[i].y < this.plain[m].y + this.plain[m].height) {
                    // 子弹的处理
                    this.bullets[i].over = 1;
                    this.bullets[i] = this.temNull;
                    this.bullets.splice(i, 1);
                    i--; //子弹减少之后i的修正
                    // 飞机的处理
                    this.plain[m].hit += this.myPower;
                    if (this.plain[m].hit >= this.plain[m].power) {
                        this.plain[m].over = 1;
                        this.score += this.plain[m].power;
                    }
                    break;
                }
            }
        }
    },
    // 创建子弹
    createBullet: function() {
        var bullet = this.temNull;
        for (var i = 0; i < 2; i++) {
            bullet = new Object();
            bullet.width = 3.5;
            bullet.height = 9;
            bullet.type = 1;
            bullet.over = 0;
            bullet.img = this.bulletImg;
            bullet.x = this.me.x + this.me.width / 2 - bullet.width / 2;
            bullet.y = this.me.y - bullet.height * i;
            this.bullets.push(bullet);
        }
    },
    move: function(ev) {
        ev = ev || window.event;
        var x = ev.pageX;;
        var y = ev.pageY;
        if (x > this.box.offsetLeft + this.me.width / 2 && x < this.box.offsetLeft + this.width - this.me.width / 2 && y > this.box.offsetTop + this.me.height / 2 && y < this.box.offsetTop + this.height - this.me.height / 2) {
            this.me.x = x - this.box.offsetLeft - this.me.width / 2;
            this.me.y = y - this.box.offsetTop - this.me.height / 2;
        }
    }
}

// 实例化flight对象
var a = new Flight();
var oBox = document.getElementById('box');
// canvas对象
var oFlight = document.getElementById('flight');
// 开始按钮
var startBtn = document.getElementById('startBtn')
    // 计分
var scoreObj = document.getElementById('score');
// 重新开始box
var oRepalyBox = document.getElementById('replay');
// pause
var oPause = document.getElementById('pause');
var oContinue = document.getElementById('continueBox');
a.init(oFlight, startBtn, scoreObj, oPause, oRepalyBox, oBox, oContinue);