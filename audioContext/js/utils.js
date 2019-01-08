/*
  author: calacirya@126.com
 */
;
(function() {
    // variable
    window.appGlobalScale = 1

    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame
    window.cancelAnimFrame = window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame

    function noop() {}

    function noopMiddleware(next) { next() }

    function isImage(src) {
        if (typeof src === 'object') {
            return src.type === 'image'
        }
        return /jpg|jpeg|png|bmp|gif$/.test(src)
    }

    function isScript(src) {
        if (typeof src === 'object') {
            return src.type === 'script'
        }
        return /js$/.test(src)
    }

    function isSprite(o) {
        return typeof o === 'object' && o.type === 'sprite'
    }

    function isAudio(src) {
        if (typeof src === 'object') {
            return src.type === 'audio'
        }
        return /mp3|ogg$/.test(src)
    }

    // 加载数组
    // fn: (item, index, callback)
    function loadManifest(manifest, onProgress, onComplete) {
        var total = manifest.length
        var count = 0
        var cache = {}

        onProgress = onProgress || noop
        onComplete = onComplete || noop

        if (total === 0) {
            onProgress({ progress: 1 })
            onComplete()
            return cache
        }

        function _onProgress(data) {
            data = data || {}
            count++
            onProgress({
                progress: count / total,
                src: data.src
            })
            if (count >= total) {
                setTimeout(onComplete, 1)
            }
        }

        manifest.forEach(function(item, index) {
            if (isImage(item)) {
                imageLoader(item, _onProgress, cache)
            } else if (isScript(item)) {
                scriptLoader(item, _onProgress)
            } else if (isAudio(item)) {
                audioLoader(item, _onProgress, cache)
            } else {
                _onProgress()
            }
        })
        return cache
    }

    function imageLoader(src, cb, cache) {
        var img = new Image()
        if (typeof src === 'object') {
            src = src.src
        }
        if (cache) {
            cache[src] = img
        }
        img.onload = _cb
        img.src = src

        if (img.complete) {
            img.onload = null
            _cb()
        }

        function _cb() {
            cb({
                src: src,
                image: img
            })
        }
    }

    function audioLoader(src, cb, cache) {
        var responseType = 'blob'
        var id
        if (typeof src === 'object') {
            if (src.buffer) {
                responseType = 'arraybuffer'
            }
            if (src.id) {
                id = src.id
            }
            src = src.src
        }
        if (!id) {
            id = src
        }

        var xhr = new XMLHttpRequest()

        // xhr.addEventListener('progress', function(e) {
        //   if (e.lengthComputable) {
        //     var percentComplete = e.loaded / e.total
        //     console.log('Downloading: ' + percentComplete + '%')
        //   }
        // })

        xhr.addEventListener('load', function(blob) {
            if (responseType === 'arraybuffer') {
                if (cache) {
                    cache[id] = xhr.response
                }
                cb({
                    src: src
                })
                return
            }
            if (xhr.status == 200 || xhr.status === 304) {
                cb({
                    src: src
                })
                // audioLink.src = window.URL.createObjectURL(xhr.response)      
            }
        })

        xhr.open('GET', src)
        xhr.responseType = responseType
        xhr.send(null)
    }

    function scriptLoader(src, cb) {
        var script = document.createElement('script')
        script.src = src
        // 动态载入的脚本默认异步执行
        script.async = false
        document.body.appendChild(script)
        script.onload = _cb

        function _cb() {
            cb({
                src: src
            })
        }
    }

    // 设置viewport
    function setViewport(width, height) {
        var deviceWidth = window.screen.width
        var deviceHeight = window.screen.height
        var winWidth = window.innerWidth
        var winHeight = window.innerHeight
        var scale
        var viewport = document.querySelector('meta[name="viewport"]')

        if (deviceWidth !== winWidth) {
            winHeight = winHeight * deviceWidth / winWidth
            winWidth = deviceWidth
        }


        if (width && height) {
            // alert(window.innerWidth + ',' + window.innerHeight)
            // console.log(width, height, deviceWidth, deviceHeight,
            //   deviceWidth / width, deviceHeight / height)
            scale = Math.min(winWidth / width, winHeight / height)
        } else if (width) {
            scale = winWidth / width
        } else if (height) {
            scale = winHeight / height
        } else {
            scale = winWidth / 750
        }

        if (viewport) {
            viewport.setAttribute('content', 'user-scalable=no, initial-scale=' + scale +
                ', maximum-scale=' + scale + ', width=device-width')
        } else {
            viewport = document.createElement('meta')
            viewport.setAttribute('name', 'viewport')
            viewport.setAttribute('content', 'user-scalable=no, initial-scale=' + scale +
                ', maximum-scale=' + scale + ', width=device-width')
            document.querySelector('head').appendChild(viewport)
        }
    }

    // 设置font-size
    function setFontSize(width, height) {
        var deviceWidth = Math.min(window.innerWidth)
        var deviceHeight = Math.min(window.innerHeight)
        var scale
        var fontSize

        if (width && height) {
            scale = Math.min(deviceWidth / width, deviceHeight / height)
        } else if (width) {
            scale = deviceHeight / height
        } else {
            scale = deviceWidth / width
        }

        var scale = Math.min(deviceWidth / width, deviceHeight / height)
        var fontSize = (scale * 100).toFixed(2)

        document.querySelector('html').style.fontSize = fontSize + 'px'
        window.appGlobalScale = scale
    }

    // 设置font-size 考虑屏幕旋转
    function setFontSize2(width, height) {
        var sw = window.screen.availWidth
        var sh = window.screen.availHeight
        var tmp
        var scale
        var fontSize

        if (sw > sh) {
            tmp = sw
            sw = sh
            sh = tmp
        }

        scale = Math.min(sw / width, sh / height)
        scale = Math.min(1, scale)
        fontSize = (scale * 100).toFixed(2)
        document.querySelector('html').style.fontSize = fontSize + 'px'
        window.appGlobalScale = scale
    }

    // 按顺序执行方法
    // queue(fn1, fn2, fn3)
    // 方法最后一个参数将是next
    function queue() {
        var list, item, cb, args

        list = arguments
        if (list.length === 0) {
            return
        }

        item = arguments[0]


        if (item instanceof Function) {
            cb = item
            args = [next]
        } else if (item.length) {
            cb = item[0]
            args = item.slice(1)
            args.push(next)
        } else {
            cb = noopMiddleware
        }

        cb.apply(null, args)

        function next() {
            var i, len, list2 = []

            for (i = 1, len = list.length; i < len; i++) {
                list2.push(list[i])
            }
            queue.apply(null, list2)
        }
    }

    function debounce(fn, wait) {
        var timer = null
        return function debounced() {
            var _this = this
            var args = arguments
            clearTimeout(timer)
            timer = setTimeout(function() {
                fn.apply(_this, args)
            }, wait)
        }
    }

    function Gesture(config) {
        var r2d = 100 / Math.PI;
        var curTouches = {};
        var startGesture = false;
        var startMove = false;
        var startDis = 0;
        var startAng = 0;
        var startCenterX = 0;
        var startCenterY = 0;
        var r2d = 180 / Math.PI;

        var totalRotate = 0;
        var totalScale = 1;
        var totalX = 0;
        var totalY = 0;
        var curRotate = 0;
        var curScale = 0;
        var curX = 0;
        var curY = 0;

        config = config || {};
        var dom = config.dom || document;
        var gesturestartCallback = config.gesturestart || function() {};
        var gesturechangeCallback = config.gesturechange || function() {};
        var gestureendCallback = config.gestureend || function() {};

        function startHandler(e) {
            var t0, t1;
            startMove = false;
            startGesture = false;
            if (e.touches.length == 1) {
                startMove = true;
                t0 = e.touches[0];
                startCenterX = t0.pageX;
                startCenterY = t0.pageY;

                gesturestartCallback();
                return;
            }
            if (e.touches.length == 2) {
                startGesture = true;
                t0 = e.touches[0];
                t1 = e.touches[1];
                startDis = Math.sqrt(Math.pow(t0.pageX - t1.pageX, 2) + Math.pow(t0.pageY - t1.pageY, 2));
                startAng = Math.atan2(t0.pageX - t1.pageX, t0.pageY - t1.pageY) * r2d;
                startCenterX = (t0.pageX + t1.pageX) / 2;
                startCenterY = (t0.pageY + t1.pageY) / 2;

                gesturestartCallback();
            }
        }

        function moveHandler(e) {
            var t0, t1, dis, ang, cenX, cenY, scale, rotate, pageX, pageY;
            e.preventDefault();
            if (!(startGesture || startMove)) {
                return;
            }
            if (startMove) {
                t0 = e.touches[0];
                cenX = t0.pageX;
                cenY = t0.pageY;

                scale = 1;
                rotate = 0;
            } else {
                t0 = e.touches[0];
                t1 = e.touches[1];
                dis = Math.sqrt(Math.pow(t0.pageX - t1.pageX, 2) + Math.pow(t0.pageY - t1.pageY, 2));
                ang = Math.atan2(t0.pageX - t1.pageX, t0.pageY - t1.pageY) * r2d;
                cenX = (t0.pageX + t1.pageX) / 2;
                cenY = (t0.pageY + t1.pageY) / 2;

                scale = dis / startDis;
                rotate = startAng - ang;
            }

            pageX = cenX - startCenterX;
            pageY = cenY - startCenterY;

            curScale = scale;
            curRotate = rotate;
            curX = pageX;
            curY = pageY;

            var bounding = dom.getBoundingClientRect()

            gesturechangeCallback({
                scale: scale,
                rotate: rotate,
                x: pageX,
                y: pageY,
                totalScale: totalScale * scale,
                totalRotate: totalRotate + curRotate,
                totalX: totalX + pageX,
                totalY: totalY + pageY,
                centerX: cenX - (bounding.left | 0),
                centerY: cenY - (bounding.top | 0)
            });
        }

        function endHandler(e) {
            startMove = false;
            startGesture = false;
            totalScale *= curScale;
            totalRotate += curRotate;
            totalX += curX;
            totalY += curY;
            curScale = 1;
            curRotate = 0;
            curX = 0;
            curY = 0;

            gestureendCallback();
        }

        this.start = function(initialize) {
            if (!dom) { return; }
            if (initialize) {
                totalRotate = 0;
                totalScale = 1;
                totalX = 0;
                totalY = 0;
                gesturechangeCallback({
                    scale: 1,
                    rotate: 0,
                    x: 0,
                    y: 0,
                    totalScale: 1,
                    totalRotate: 0,
                    totalX: 0,
                    totalY: 0,
                    centerX: 0,
                    centerY: 0
                });
            }
            dom.addEventListener('touchstart', startHandler, { passive: false });
            document.addEventListener('touchmove', moveHandler, { passive: false });
            document.addEventListener('touchend', endHandler, { passive: false });
        }
        this.stop = function() {
            if (!dom) { return; }
            dom.removeEventListener('touchstart', startHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
        }
    };

    function ImageCtrl(canvas) {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        var w = canvas.width;
        var h = canvas.height;
        var image;
        var bgColor = 'rgba(0,0,0,0)';
        var regX;
        var regY;
        var startScale;
        var startRotate;
        var ctx = canvas.getContext('2d');
        var isLooped = false;
        var self = this;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.rotate = 0;
        this.centerX = 0
        this.centerY = 0
        this.render = render;
        // this.start = start;
        // this.stop = stop;
        this.setImage = setImage;
        this.getBase64 = getBase64;
        this.destroy = destroy

        var gestureCtrl = new Gesture({
            dom: canvas,
            gesturestart: function(e) {
                isLooped = true
                loop()
            },
            gesturechange: function(e) {
                // console.log(e)
                self.x = e.totalX
                self.y = e.totalY
                self.rotate = e.totalRotate
                self.scale = e.totalScale
                self.centerX = e.centerX - (w >> 1)
                self.centerY = e.centerY - (h >> 1)
            },
            gestureend: function(e) {
                isLooped = false
            }
        })

        function setImage(_image, _rotate, _bgColor) {
            image = _image
            var w = image.naturalWidth || image.width
            var h = image.naturalHeight || image.height
            regX = w >> 1;
            regY = h >> 1;
            startScale = Math.max(canvas.width / w, canvas.height / h);
            startRotate = _rotate
            bgColor = _bgColor || 'rgba(0,0,0,0)'

            this.x = 0;
            this.y = 0;
            this.scale = 1;
            this.rotate = 0;
            this.cenX = 0
            this.cenY = 0
            render()
            gestureCtrl.start(true)
        }

        function loop() {
            render();
            if (isLooped) {
                requestAnimationFrame(loop);
            }
        }

        function render() {
            var scale = startScale * self.scale
            var rotate = (self.rotate + startRotate) * Math.PI / 180

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, w, h)
            ctx.save();

            // ctx.translate(self.centerX, self.centerY)

            ctx.translate(self.x + (w >> 1), self.y + (h >> 1));
            ctx.scale(scale, scale);
            // ctx.translate( - self.centerX / scale, - self.centerY / scale)
            ctx.rotate(rotate);
            ctx.translate(-regX, -regY);
            ctx.drawImage(image, 0, 0);
            ctx.restore();
        }

        function getBase64() {
            return canvas.toDataURL('image/jpeg')
        }

        function destroy() {
            gestureCtrl.stop()
        }
    }

    function createImageList(base, length, ext) {
        var i
        var arr = []
        for (i = 0; i < length; i++) {
            arr.push(base + i + ext)
        }
        return arr
    }

    function addImageList(arr, base, length, ext) {
        var i
        for (i = 0; i < length; i++) {
            arr.push(base + i + ext)
        }
    }

    function addManifest(arr, arr2) {
        arr2.forEach(function(item) {
            if (isSprite(item)) {
                addSprite(arr, item)
            } else {
                arr.push(item)
            }
        })
    }

    function addSprite(arr, config) {
        var i
        var src = config.src
        var length = config.length
        var base = config.base
        var ext = config.extension

        if (src) {
            arr.push(src)
            return
        }

        for (i = 0; i < length; i++) {
            arr.push(base + i + ext)
        }
    }


    /*
      2018/12/14
      以下方法需要Promise
      图像缩放处理
    */
    function loadImagePromise(src) {
        return new Promise(function(resolve) {
            var img = new Image()

            img.onload = function() {
                resolve(img)
            }
            img.src = src
            if (img.complete) {
                img.onload = null
                resolve(img)
            }
        })
    }

    function getImageBase64(img) {
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        return canvas.toDataURL("image/jpeg", 0.8)
    }

    function getImageBase64BySrc(src) {
        return loadImagePromise(src).then(function(img) {
            return getImageBase64(img)
        })
    }

    function resizeImage(img, min, rotate) {
        var w, h
        var rotate, scale
        var regX, regY
        var cX, cY
        var imgW, imgH
        var canvasW, canvasH

        w = img.naturalWidth || img.width
        h = img.naturalHeight || img.height
        regX = w >> 1
        regY = h >> 1
        rotate = rotate || 0

        if (rotate === 90 || rotate === -90) {
            imgW = h
            imgH = w
        } else {
            imgW = w
            imgH = h
        }

        scale = Math.min(1, min / Math.min(w, h))
        canvasW = (imgW * scale) | 0
        canvasH = (imgH * scale) | 0
        cX = canvasW >> 1
        cY = canvasH >> 1

        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        canvas.width = canvasW
        canvas.height = canvasH
        ctx.translate(cX, cY)
        ctx.scale(scale, scale)
        ctx.rotate(rotate * Math.PI / 180)
        ctx.translate(-regX, -regY)
        ctx.drawImage(img, 0, 0)
        var pic = canvas.toDataURL('image/jpeg', 0.8)

        return new Promise(function(resolve) {
            resolve(pic)
        })
    }

    function getResizedImageBase64BySrc(src, min, rotate) {
        return loadImagePromise(src).then(function(img) {
            return resizeImage(img, min, rotate)
        })
    }

    function cutImage(img, cw, ch, rotate) {
        var w, h
        var s1, s2
        var rotate, scale
        var regX, regY
        var cX, cY
        var imgW, imgH
        var canvasW, canvasH

        w = img.naturalWidth || img.width
        h = img.naturalHeight || img.height
        regX = w >> 1
        regY = h >> 1
        rotate = rotate || 0

        if (rotate === 90 || rotate === -90) {
            imgW = h
            imgH = w
        } else {
            imgW = w
            imgH = h
        }

        s1 = imgW / imgH
        s2 = cw / ch
        scale = s1 < s2 ? cw / imgW : ch / imgH
        canvasW = cw
        canvasH = ch
        cX = canvasW >> 1
        cY = canvasH >> 1

        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        canvas.width = canvasW
        canvas.height = canvasH
        ctx.translate(cX, cY)
        ctx.scale(scale, scale)
        ctx.rotate(rotate * Math.PI / 180)
        ctx.translate(-regX, -regY)
        ctx.drawImage(img, 0, 0)
        var pic = canvas.toDataURL('image/jpeg', 0.8)

        return new Promise(function(resolve) {
            resolve(pic)
        })
    }

    function getCutImageBase64BySrc(src, cw, ch, rotate) {
        return loadImagePromise(src).then(function(img) {
            return cutImage(img, cw, ch, rotate)
        })
    }

    /*
      图像缩放处理结束
    */


    // 等待ms毫秒
    function wait(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms)
        })
    }

    // 重试某个异步操作，最多重试maxCount次
    function retry(fn, args, maxCount, interval) {

        function innerFn(fn, args, maxCount, count, resolve, reject) {
            // console.log(count + 1 + '/' + maxCount)
            fn.apply(null, args).then(function() {
                resolve()
            }, function() {
                count = count || 0
                if (count < maxCount) {
                    wait(interval || 1).then(function() {
                        innerFn(fn, args, maxCount, count + 1, resolve, reject)
                    })
                } else {
                    reject('已达到最大尝试上限')
                }
            })
        }

        return new Promise(function(resolve, reject) {
            innerFn(fn, args, maxCount, 0, resolve, reject)
        })
    }

    // 检查输入是否合法，非法则抛出异常
    function checkInput(val, reg, err) {
        // console.log(val)
        if (typeof reg === 'boolean') {
            if (val !== reg) {
                throw new Error(err)
            }
            return
        } else if (typeof reg === 'string') {
            if (typeof val !== reg) {
                throw new Error(err)
            }
            return
        }
        if (val && val.trim) {
            val = val.trim()
        }
        if (!reg.test(val)) {
            throw new Error(err)
        }
    }

    // 获取文字长度，汉字长度为2
    function getStringLength(str) {
        var l = str.length
        var c = 0
        for (i = 0; i < l; i++) {
            if ((str.charCodeAt(i) & 0xff00) != 0) {
                c++
            }
            c++
        }
        return c
    }

    // 数组分段
    function chunk(arr, size) {
        var arr2 = []
        var i, j, k, len
        arr2[0] = []
        for (i = 0, j = 0, k = 0, len = arr.length; i < len; i++, j++) {
            if (j == size) {
                j = 0
                arr2[++k] = []
            }
            arr2[k][j] = arr[i]
        }

        return arr2
    }

    // 检查是否旋转
    var resizeTimerId

    function hasOriented() {
        cancelAnimationFrame(resizeTimerId)
        return new Promise(function(resolve) {
            var count = 0
            var h0 = window.innerHeight

            function check(count, h) {
                var h = window.innerHeight
                if (h !== h0 || count >= 100) {
                    resolve()
                } else {
                    count++
                    resizeTimerId = requestAnimationFrame(check)
                }
            }
            check()
        })
    }

    var searchParams = (function() {
        var h = window.location.href
        var p
        var s = h.replace(/^.*\?(.*)$/, '$1')
        var a, o = {}
        var v
        var i, len

        if ((p = h.indexOf('?')) < 0) {
            return o
        }
        s = h.substr(p + 1)
        a = s.split('&')
        for (i = 0, len = a.length; i < len; i++) {
            v = a[i].split('=')
            if (v.length == 2) {
                o[v[0]] = decodeURIComponent(v[1])
            }
        }
        return o
    })()

    // 页面旋转控制 一直保持横屏
    function RotateCtrl(selector) {
        var ROTATABLE = 'onorientationchange' in window

        this.el = null
        this.width = 0
        this.height = 0
        this.rotate = false
        this.matrix = null
        this._listeners = []
        this._rotateTimerId = 0
        this.EVENT_TYPE = 'resize'
        this.onRotate = this.onRotate.bind(this)
        this.onRotateEnd = this.onRotateEnd.bind(this)

        if (!ROTATABLE) {
            return
        }

        this.init(selector)
    }
    RotateCtrl.prototype.init = function(selector) {
        this.el = document.querySelector(selector)
        this.onRotateEnd()
        window.addEventListener(this.EVENT_TYPE, this.onRotate)
    }
    RotateCtrl.prototype.destroy = function(selector) {
        clearTimeout(this._rotateTimerId)
        window.removeEventListener(this.EVENT_TYPE, this.onRotate)
    }
    RotateCtrl.prototype.notify = function(event) {
        this._listeners.forEach(function(cb) {
            cb(event)
        })
    }
    RotateCtrl.prototype.createRotateEvent = function() {
        return { type: 'rotatestart' }
    }
    RotateCtrl.prototype.createRotateEndEvent = function() {
        return {
            type: 'rotateend',
            width: this.width,
            height: this.height,
            rotate: this.rotate,
            matrix: this.matrix
        }
    }
    RotateCtrl.prototype.onRotate = function() {
        clearTimeout(this._rotateTimerId)
        this._rotateTimerId = setTimeout(this.onRotateEnd, 500)
        this.notify(this.createRotateEvent())
    }
    RotateCtrl.prototype.onRotateEnd = function() {
        var o = window.orientation
        var w = window.innerWidth
        var h = window.innerHeight
        var w2 = Math.max(w, h)
        var h2 = Math.min(w, h)
        var r = w < h
        var m = r ? [0, -1, 1, 0, 0, h2] : null
        var el = this.el

        this.width = w2
        this.height = h2
        this.rotate = r
        this.matrix = m

        if (r) {
            el.style.width = w2 + 'px'
            el.style.height = h2 + 'px'
            el.style.position = 'absolute'
            el.style.left = '100%'
            el.style.top = '0'
            el.style.webkitTransormOrigin = el.style.transformOrigin = '0 0'
            el.style.webkitTransform = el.style.transform = 'rotate(90deg)'
        } else {
            el.style.cssText = ''
        }

        this.notify(this.createRotateEndEvent())
    }

    RotateCtrl.prototype.subscribe = function(cb) {
        var _this = this
        cb(this.createRotateEndEvent())
        this._listeners.push(cb)

        return function unsubstribe() {
            var list = _this._listeners
            var i, len
            for (i = 0, len = list.length; i < len; i++) {
                if (list[i] === cb) {
                    list.splice(i, 1)
                    _this = null
                    return
                }
            }
        }
    }


    // canvas绘制
    function Bitmap(config) {
        var _this = this
        var cache = {}
        var src = config.src
        this.x = config.x || 0
        this.y = config.y || 0
        this.scaleX = config.scaleX || 1
        this.scaleY = config.scaleY || 1
        this.alpha = config.opapcity || 1
        this.src = src
        this.image = null
        this.width = 0
        this.height = 0
        this.loaded = false
        imageLoader(src, function() {
            var img = cache[src]
            cache = null
            _this.loaded = true
            _this.image = img
            _this.width = img.width
            _this.height = img.height
        }, cache)
    }
    Bitmap.prototype.draw = function(ctx) {
        if (!this.loaded) {
            return
        }
        var regX = this.width >> 1
        var regY = this.height >> 1
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.translate(this.x | 0, this.y | 0)
        ctx.translate(regX, regY)
        ctx.scale(this.scaleX, this.scaleY)
        ctx.translate(-regX, -regY)
        ctx.drawImage(this.image, 0, 0)
        ctx.restore()
    }

    function Stage(config) {
        var canvas = config.canvas
        var w = config.width
        var h = config.height
        var s = config.scale || 1

        w *= s
        h *= s

        this.canvas = canvas
        canvas.width = w
        canvas.height = h
        this.width = w
        this.height = h
        this.x = config.x || 0
        this.y = config.y || 0
        this.scale = s
        this.ctx = this.canvas.getContext('2d')
        this.children = []
        this.playing = true
        this.timeId = 0

        this.update = this.update.bind(this)
        this.tick = this.tick.bind(this)
        this.untick = this.untick.bind(this)
    }
    Stage.prototype.set = function(config) {
        var s = this.scale
        if ('scale' in config) {
            s = this.scale = config.scale
        }
        if ('width' in config) {
            this.width = this.canvas.width = config.width * s
        }
        if ('height' in config) {
            this.height = this.canvas.height = config.height * s
        }
        if ('x' in config) {
            this.x = config.x
        }
        if ('y' in config) {
            this.y = config.y
        }
    }
    Stage.prototype.add = function() {
        var args = arguments
        Array.prototype.push.apply(this.children, arguments)
    }
    Stage.prototype.update = function() {
        var ctx = this.ctx
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.save()
        ctx.scale(this.scale, this.scale)
        ctx.translate(this.x, this.y)
        this.children.forEach(function(o) {
            o.draw(ctx)
        })
        ctx.restore()
    }
    Stage.prototype.tick = function(cb) {
        var _this = this

        function loop() {
            if (!_this.playing) {
                return
            }
            cb()
            _this.timeId = requestAnimationFrame(loop)
        }

        this.playing = true
        loop()
    }
    Stage.prototype.untick = function() {
        this.playing = false
        cancelAnimationFrame(this.timeId)
        console.log('untick')
    }


    window.CalaryUtils = {
        loadManifest: loadManifest,
        setViewport: setViewport,
        setFontSize: setFontSize,
        setFontSize2: setFontSize2,
        queue: queue,
        debounce: debounce,
        ImageCtrl: ImageCtrl,
        addManifest: addManifest,
        addSprite: addSprite,
        loadImagePromise: loadImagePromise,
        getImageBase64BySrc: getImageBase64BySrc,
        getResizedImageBase64BySrc: getResizedImageBase64BySrc,
        getCutImageBase64BySrc: getCutImageBase64BySrc,
        wait: wait,
        retry: retry,
        checkInput: checkInput,
        chunk: chunk,
        hasOriented: hasOriented,
        searchParams: searchParams,
        RotateCtrl: RotateCtrl,
        Bitmap: Bitmap,
        Stage: Stage
    }
})()