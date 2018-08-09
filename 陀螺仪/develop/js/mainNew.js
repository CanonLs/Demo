$(document).ready(function() {
    var vConsole = new VConsole();
    // var input;
    $(".btn").on("click", function() {
        var input = document.querySelector(".input");
        $(input).replaceWith("<input class='input' type='file' accept='image/*' name='" + Math.random() + "'>").trigger('click');
        input.addEventListener("change", function() {
            console.log(this.files);
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
    });

    function creatCanvas(imgSrc, w, h) {
        var canvas = document.querySelector("#cas");
        canvas.width = $(".wk").width();
        canvas.height = $(".wk").height();
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.src = imgSrc;
        img.onload = function() {
            var px = ($(".wk").width() - img.width) / 2;
            var py = ($(".wk").height() - img.height) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, px, py, w, h);
            // strDataURI = canvas.toDataURL();
            pinchRotate(canvas, ctx, img, px, py);
        }
    };
    function pinchRotate(el, ctx, img, x, y) {
        var kw = $(".wk").width();
        var kh = $(".wk").height();
        var imgw = img.width;
        var imgh = img.height;
        var ele = el,
            ctx = ctx,
            px = x,
            py = y,
            sc = 1,
            sx = 1,
            dx = 0,
            dy = 0,
            ro = 0;
        new AlloyFinger(ele, {
            rotate: function(evt) {
                ro += evt.angle;
                ctrlCanvas();
            },
            pinch: function(evt) {
                sx = (evt.zoom).toFixed(2) * sc;
                ctrlCanvas();
            },
            multipointEnd: function() {
                sc = sx;
            },
            pressMove: function(evt) {
                dx += evt.deltaX;
                dy += evt.deltaY;
                ctrlCanvas();
            }
        });

        function ctrlCanvas() {
            ctx.save();
            ctx.clearRect(0, 0, ele.width, ele.height);
            ctx.translate(kw / 2 + dx, kh / 2 + dy);
            ctx.scale(sx, sx)
            ctx.rotate(ro * Math.PI / 180);
            ctx.drawImage(img, -kw / 2 + px, -kh / 2 + py, imgw, imgh);
            ctx.restore();
        }
    };

    
})