var CameraScan = (function () {
    var worker = new Worker('zbar-processor.js');
    var video = document.querySelector("video");
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var timerId = null;
    var imageData = null;
    var scanFlag = false;

    var scan = function () {
        if (!scanFlag) {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = Math.ceil(video.videoWidth);
                canvas.height = Math.ceil(video.videoHeight);
                ctx.drawImage(video, 0, 0);
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                worker.postMessage(imageData, [imageData.data.buffer]);
                imageData = null;
            }
        }
    }

    return {
        startScan: function () {
            if (!navigator.mediaDevices) {
                alert("p1:カメラを起動できないためご利用いただけません");
                return;
            }

            var constraints = { audio: false, video: { facingMode: "environment" } };

            navigator.mediaDevices.getUserMedia(constraints).then(
                function (stream) {
                    video.srcObject = stream;
                    video.setAttribute("playsinline", true);
                    video.play();
                    timerId = setInterval(scan, 1000);
                }).catch(function (e) {
                    if (e.name == "NotAllowedError") {
                        alert("p2:ブラウザからのカメラアクセスを許可してください");
                    } else {
                        alert("p2:カメラを起動できないためご利用いただけません:" + e);
                    }
                });
        },
        setCallback: function (callback) {
            worker.onmessage = function (event) {
                if (!scanFlag) {
                    if (event.data.length == 0) return;
                    callback(event.data);
                }
            }
        },
        stopScan: function () {
            scanFlag = true;
            clearInterval(timerId);
            video.pause();
        },
        restartScan: function () {
            video.play();
            timerId = setInterval(scan, 1000);
            scanFlag = false;
        }
    }
})();
