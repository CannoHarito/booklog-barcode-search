import CameraScan from './cameraScan.js'
let overIframe = false;
document.addEventListener('DOMContentLoaded', () => {
    const cameraScan = new CameraScan();
    cameraScan.setCallback(
        (res) => { return scanCallback(res, cameraScan); }
    );
    cameraScan.startScan().catch(err => {
        closeScanner(); cameraScan.releaseCamera();
        if (err !== 'scanFlag') alert(err);
    });
    document.querySelector('#startScan').addEventListener('click', () => openScanner(cameraScan));
    const iframe = document.querySelector('iframe')
    iframe.addEventListener(
        'mouseover', () => overIframe = true
    );
    iframe.addEventListener(
        'mouseout', () => overIframe = false
    );
    window.addEventListener('blur', () => overIframe && (closeScanner(), cameraScan.releaseCamera()));
});
const scanCallback = (results, cameraScan) => {
    cameraScan.stopScan();
    const data = results.find(d => !/^19[12]/.test(d[2]));
    if (data) {
        document.querySelector('iframe').src = "http://booklog.jp/blet?s=" + data[2];
        closeScanner();
        cameraScan.releaseCamera();
        return;
    }
    return cameraScan.restartScan();
};
const closeScanner = () => {
    document.querySelector('iframe').className = 'open';
    document.querySelector('#startScan').style = 'display:inline-block';
};
const openScanner = (cameraScan) => {
    document.querySelector('iframe').className = '';
    document.querySelector('#startScan').style = 'display:none';
    cameraScan.startScan().catch(err => {
        closeScanner(); cameraScan.releaseCamera(); if (err !== 'scanFlag') alert(err);
    });
};