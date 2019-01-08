(function() {
    //微信下h5自动播放
    var music = document.getElementById("mic");

    function audioAutoPlay(id) {
        var audio = document.getElementById(id);

        if (window.WeixinJSBridge) {
            WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
                audio.play();
            }, false);
        } else {
            document.addEventListener("WeixinJSBridgeReady", function() {
                WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
                    audio.play();
                });
            }, false);
        }
        audio.play();

        return false;
    }
    audioAutoPlay('mic');

    //audiocontext 同时播放多条音乐
    var AudioContext = window.AudioContext || window.webkitAudioContext
    var context = new AudioContext()
    var manifest = [
        { type: 'audio', buffer: true, src: '../src/t1.mp3', id: 'lead' },
        { type: 'audio', buffer: true, src: '../src/t2.mp3', id: 'rhythm' }
    ]
    var cache = CalaryUtils.loadManifest(manifest, null, onload)
    var leadBuffer
    var rhythmBuffer
    var loaded = false

    function onload(list) {
        loaded = true
        $('#status').html('音频加载完成')

        decodeBuffer(cache.lead, function(buffer) {
            leadBuffer = buffer
        })
        decodeBuffer(cache.rhythm, function(buffer) {
            rhythmBuffer = buffer
        })

        $('#playLead').on('click', function() {
            playBuffer(leadBuffer)
        })

        $('#playRhythm').on('click', function() {
            playBuffer(rhythmBuffer)
        })

    }

    function decodeBuffer(buffer, cb, onerror) {
        context.decodeAudioData(buffer, cb, onerror);
    }

    function playBuffer(buffer) {
        console.log("begin")
        var source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.start(0) // note: on older systems, may have to use deprecated noteOn(time);
        $("#playsuspend").on("click", function() {
            context.suspend() //控制所有音轨暂停
        })
        $("#playresume").on("click", function() {
            context.resume() //恢复所有音轨
        })
        return source
    }
})()

//chrome下自动播放
try {
    var context = new window.AudioContext();;
    var source = null;
    var audioBuffer = null;

    function stopSound() {
        if (source) {
            source.stop(0); //立即停止
        }
    }

    function playSound() {
        source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(context.destination);
        source.start(0); //立即播放
    }

    function initSound(arrayBuffer) {
        context.decodeAudioData(arrayBuffer, function(buffer) { //解码成功时的回调函数
            audioBuffer = buffer;
            playSound();
        }, function(e) { //解码出错时的回调函数
            console.log('Error decoding file', e);
        });
    }

    function loadAudioFile(url) {
        var xhr = new XMLHttpRequest(); //通过XHR下载音频文件
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) { //下载完成
            initSound(this.response);
        };
        xhr.send();
    }
    loadAudioFile('../src/music.mp3');
    $("#stop").click(function() {
        stopSound();
    });
} catch (e) {
    console.log('!Your browser does not support AudioContext');
}