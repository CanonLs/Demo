var winWidth = $(window).width(),
    winHeight = $(window).height(),
    backgroundBox = $(".background");
var pW = 8192 * winHeight / 862;
var pH = winHeight;
//移动速度
var speed = 0;
//移动速度系数
var speedCoefficient = 0.1;
//当前位置
var defaultLeft = -pW / 4;
//左边位置
var iLeft = -pW / 4 + winWidth;
var ziLeft = -3 * pW / 4 + winWidth;
//右边位置
var iRigth = -3 * pW / 4 - winWidth;
var ziRight = -pW / 4 - winWidth;

function init() {
    //设置区域大小位置
    backgroundBox.css({ 'width': pW, 'height': pH, 'top': 0, 'left': defaultLeft, 'display': 'block', 'overflow-x': 'hidden' });

}
init();
$("body").css({ 'width': winWidth, 'height': winHeight });
//绑定点击事件
$(".background").delegate('.redbox', 'click', function(e) {
    alert($(this).attr('id'));
})


var flat = true; //初始化默认值
initFlag = true, //初始化init
    delayTime = 0, //延迟100ms执行deviceorientation事件
    dateNowDelay = Date.now();

function orientationHandler(event) {
    alpha_cha = event.alpha;
    beta_cha = event.beta;
    gamma_cha = event.gamma;
    if (initFlag || (dateNowDelay + delayTime) ){
            if (initFlag) {
                init();
                initFlag = false;
            }
            if (gamma_cha >= 20 || gamma_cha <= -20) {
                speed = gamma_cha * speedCoefficient;
            } else {
                speed = 0;
            }
            dateNowDelay = Date.now();
        }
    }
    window.setInterval(function() {
        // console.log('位置1',defaultLeft,speed);
        if (speed == 0) {
            return;
        }
        defaultLeft += speed;
        if (defaultLeft > iLeft) {
            defaultLeft = ziLeft;
        } else if (defaultLeft) {
            defaultLeft = ziRight;
        }
        $(".background").css('left', defaultLeft)
    }, 100);

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", orientationHandler, false);
    } else {
        document.body.innerHTML = "What user agent u r using？？？";
    };