import WorkerWrapper from './workerWrapper.js'
const defaultWorkerURL = 'zbar-processor.js';
let canvas = null;
let ctx = null;

export default class CameraScan {
    constructor(
        video = document.querySelector('video'),
        workerURL = defaultWorkerURL
    ) {
        if (!canvas) {
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
        }
        this.video = video;
        this.scanCallback = (d => {
            return d;
        });
        this.worker = new WorkerWrapper(workerURL);
        this.scanFlag = false;
    }
    scan() {
        return new Promise((resolve, reject) => {
            if (this.scanFlag && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                canvas.width = Math.ceil(this.video.videoWidth);
                canvas.height = Math.ceil(this.video.videoHeight);
                ctx.drawImage(this.video, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                resolve(imageData);
            } else reject('scanFlag');
        }).then((imageData) => {
            return this.worker.post(imageData, [imageData.data.buffer])
        }).then((data) => {
            if (!this.scanFlag) throw ('scanFlag');
            console.log('Scan:[' + data.join('], ['));
            if (data.length === 0) return this.scan();
            return Promise.resolve().then(() => this.scanCallback(data));
        });
    }
    async startScan() {
        try {
            if (!navigator.mediaDevices) {
                throw ("カメラを起動できないためご利用いただけません:navigator.mediaDevices=" + navigator.mediaDevices);
            }
            const constraints = { audio: false, video: { facingMode: "environment", frameRate: 10, } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            this.video.setAttribute("playsinline", true);
            await waitVideo(this.video);
            this.video.play();
            this.scanFlag = true;
            return this.scan();
        }
        catch (e) {
            if (e.name == "NotAllowedError") {
                throw ("ブラウザからのカメラアクセスを許可してください:NotAllowedError");
            }
            else {
                throw e;
            }
        }
    }
    stopScan() {
        this.scanFlag = false;
        this.video.pause();
    }
    restartScan() {
        this.video.play();
        this.scanFlag = true;
        return this.scan();
    }
    releaseCamera() {
        if (this.scanFlag) this.stopScan();
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(
                (track) => track.stop()
            );
            this.video.srcObject = null;
        }
    }
    setCallback(callback) {
        this.scanCallback = callback;
    }
}

const waitVideo = (video = document.querySelector('video')) => {
    return new Promise((resolve) => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) return resolve(video.readyState);
        video.addEventListener('canplay', (e) => resolve(e.target.readyState));
    });
};
