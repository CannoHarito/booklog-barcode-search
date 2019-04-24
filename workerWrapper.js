
export default class WorkerWrapper {
    constructor(workerUrl) {
        this._resolves = [];
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = (event) => {
            const resolve = this._resolves.shift();
            resolve(event.data);
        };
    }
    post(message, buff = false) {
        return new Promise((resolve) => {
            this._resolves.push(resolve);
            if (buff) this.worker.postMessage(message, buff);
            else this.worker.postMessage(message);
        });
    }
}