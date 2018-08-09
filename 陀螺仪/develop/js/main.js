$(document).ready(function() {
    var vConsole = new VConsole();
    $(".btn").on("click", function() {
        $(".input").trigger('click');
    })
    var input = document.querySelector(".input");
    input.addEventListener("change", function() {
        var files = this.files;
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = function() {
            var img = new Image();
            img.src = this.result;
            img.onload = function() {
                var width = this.width;
                var height = this.height;
                creatCanvas(img.src, width, height);
            }
        }
    })

    function creatCanvas(imgSrc, w, h) {
        var canvas = document.createElement("canvas");
        canvas.width = $(".wk").width();
        canvas.height = $(".wk").height();
        $(".wk")[0].appendChild(canvas);
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.src = imgSrc;
        img.onload = function() {
            var px = ($(".wk").width() - img.width) / 2;
            var py = ($(".wk").height() - img.height) / 2;
            ctx.drawImage(img, px, py, w, h);
            // strDataURI = canvas.toDataURL();
            pinchRotate(canvas, ctx, img, px, py);
        }
    }

    function pinchRotate(el, ctx, img, x, y) {
        var kw = $(".wk").width();
        var kh = $(".wk").height();
        var imgw = img.width;
        var imgh = img.height;
        var ele = el;
        var ctx = ctx;

        var px = x;
        var py = y;
        var spx = 0;
        var spy = 0;
        var ro = 0;
        // var sc = 1;
        var sc = 1;
        var xs = 1;
        var dx = 0;
        var dy = 0;

        new AlloyFinger(ele, {

            rotate: function(evt) {
                $(".rotate span").html(evt.angle);
                ro += evt.angle;
                console.log(ro,evt.angle)


                ctx.save();
                ctx.clearRect(0,0,ele.width,ele.height);

                ctx.translate(300, 300);
                ctx.rotate(ro*Math.PI/180);
                ctx.drawImage(img, px+ dx-300, py+ dy-300, imgw*xs,imgh*xs);
                ctx.restore();

            },

            pinch: function(evt) {

                ctx.clearRect(0, 0, ele.width, ele.height);
                xs = (evt.zoom).toFixed(2) * sc;
                px = (kw - imgw * xs) / 2;
                py = (kh - imgh * xs) / 2;
                ctx.drawImage(img, px + dx, py + dy, imgw * xs, imgh * xs);
            },
            multipointEnd: function() {
                sc = xs;
            },
            pressMove: function(evt) {
                $(".px span").html(evt.deltaX);
                $(".py span").html(evt.deltaY);
                dx += evt.deltaX;
                dy += evt.deltaY;
                ctx.save();
                ctx.clearRect(0, 0, ele.width, ele.height);
                ctx.translate(300, 300);
                ctx.rotate(ro*Math.PI/180);
                ctx.drawImage(img, px + dx-300, py + dy-300, img.width * sc, img.height * sc);
                ctx.restore();

            }
        });
    }


})