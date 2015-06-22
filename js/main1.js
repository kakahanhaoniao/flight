function Flight(){}
Flight.prototype={
    constructor:Flight,
    init:function(obj,startBtn,scoreBox,continueBox){
       this.ctx=obj.getContext('2d');
       this.width=obj.width;
       this.height=obj.height; 
       this.bgImg=this.loadImg('img/bg.jpg');
       this.plain1=this.loadImg('img/plain1.png');
       this.plain2=this.loadImg('img/plain2.png');
       this.plain3=this.loadImg('img/plain3.png');
       this.myplain=this.loadImg('img/me.png');
       this.logo=this.loadImg('img/logo.png');
       this.loadimg=this.loadImg('img/loading.png');
       this.bulletImg=this.loadImg('img/cartridge.png');
       this.bgImg.top=this.lastTime=0;
       this.loadimg.left=0;
       this.timer=null;
       this.speed=2;
       this.bulletSpeed=10;
       this.plain=[];
       this.bullets=[];
       this.me=null;
       this.startBtn=startBtn;
       this.continueBox=continueBox;
       this.scoreBox=scoreBox;
       this.drawBg();
       this.loadingloop();
    },
    // 画背景
    drawBg:function(){
        this.ctx.drawImage(this.bgImg,30,this.bgImg.top,430,500,0,0,this.width,this.height);
        this.ctx.drawImage(this.bgImg,30,this.bgImg.top+853,430,500,0,0,this.width,this.height);
    },
    // 页面加载动画
    loadingloop:function(){
        var _this=this;
        this.loading();
        if(this.loadimg.left<300){
            // 飞机加载动画
            this.timer=setTimeout(function(){
                _this.loadingloop.call(_this);
            },1000/60);
        }else{
            // logo加载
            this.ctx.drawImage(this.logo,50,150,300,70);
            this.startBtn.style.display='block';
            this.startBtn.onclick=function(){
                this.style.cssText='';
                _this.startPlay();
            }
        }           
    },
    // 加载页面飞机加载
    loading:function(){
        var _this=this;
        this.loadimg.left+=4;
        this.drawBg();
        this.ctx.drawImage(this.loadimg,this.loadimg.left-200,250);            
    },
    // 图片预加载
    loadImg:function(url){
        var img=new Image();
        img.src=url;
        img.onload=function(){}
        return img;
    },
    // 开始游戏
    startPlay:function(){
        this.scoreBox.style.display='block';
        // 创建自己的飞机
        this.me=this.createFly(0);        
        this.loop();
    },
    // 定时器
    loop:function(){
        var _this=this;
        this.lastTime=0;
        this.timer=setInterval(function(){
            // 设置背景移动
            _this.drawBg();
            _this.bgImg.top--;
            if(_this.bgImg.top<-853){
                _this.bgImg.top=0;
            }
            // 创建子弹
            if(_this.bgImg.top%5==0){
                _this.createBullet();
            }
            _this.lastTime+=30;
            // 定时创建敌机
            if(_this.lastTime%2400==0){
                _this.createFly(1);
            }else if(_this.lastTime%5700==0){
                _this.createFly(2);
            }else if(_this.lastTime%20100==0){
                _this.createFly(3);
            }
            if(_this.lastTime%18000==0){
                _this.speed+=0.5;
            }
            // 改变位置（敌机）
            _this.changeAllPlainPosition(_this.plain);
            // 改变自己的位置
            _this.changePosition(_this.me);            
            // 改变子弹位置            
            _this.changeAllPlainPosition(_this.bullets);
            
        },30);
    },
    // 改变敌机/子弹位置
    changeAllPlainPosition:function(aobj){
        for(var i=0;i<aobj.length;i++){
            //type 为1是子弹
            aobj[i].type?aobj[i].y-=this.bulletSpeed:aobj[i].y+=this.speed*aobj[i].aSpeed;
            if(aobj[i].type?(aobj[i].y<0):(aobj[i].y>(this.height+aobj[i].height))){
               aobj[i]=null;
               aobj.splice(i,1); 
            }else{
                this.changePosition(aobj[i]);
            }          
        }
    },
    // 创建飞机
    createFly:function(flyType){
        var create=new Object();
        switch(flyType){
            case 1:
                create.width=24.5;
                create.height=17.5;
                create.picLun=4;//飞机多少帧
                create.power=1000;//飞机能量
                create.img=this.plain1;
                break;
            case 2:
                create.width=34.5;
                create.height=46;
                create.picLun=5;
                create.power=5000;
                create.img=this.plain2;
                break;
            case 3:
                create.width=82.5;
                create.height=128;
                create.picLun=7;
                create.power=10000;
                create.img=this.plain3;
                break;
            default:
                create.width=49;
                create.height=61;
                create.picLun=5;
                create.img=this.myplain;
        }
        // 被打击的能量
        create.hit=0;
        // 是否死亡
        create.over=0;
        // 加速度
        create.aSpeed=0.7+Math.random()*0.5;
        // 所在图像帧
        create.picNum=0;
        if(flyType>=1 && flyType<=3){
            this.plain.push(create);
            create.x=Math.random()*(this.width-create.width);
            create.y=-create.height;
        }else{
            create.x=(this.width-create.width)/2;
            create.y=this.height-create.height;
        }    
        return create;
    },
    // 修改单个对象的位置
    changePosition:function(obj){
        if(obj.type){
            this.ctx.drawImage(obj.img,obj.x,obj.y,obj.width,obj.height);
        }else{
           this.ctx.drawImage(obj.img,obj.picNum*obj.width*2,0,obj.width*2,obj.height*2,obj.x,obj.y,obj.width,obj.height); 
        }
        
    },
    // 创建子弹
    createBullet:function(){
        var bullet=null;
        for(var i=0;i<3;i++){
            bullet=new Object();
            bullet.width=3.5;
            bullet.height=9;
            bullet.type=1;
            bullet.img=this.bulletImg;
            bullet.x=this.me.x+this.me.width/2-bullet.width/2;
            bullet.y=this.me.y-bullet.height*i;
            this.bullets.push(bullet);
        }
    }
}

// 实例化flight对象
var a=new Flight();
// canvas对象
var oFlight=document.getElementById('flight');
// 开始按钮
var startBtn=document.getElementById('startBtn')
// 计分
var scoreObj=document.getElementById('score');
a.init(oFlight,startBtn,scoreObj);


