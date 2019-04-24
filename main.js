let overIframe = false;
document.addEventListener('DOMContentLoaded', () => {
    CameraScan.setCallback(callback);
    CameraScan.startScan();
    document.querySelector('#startScan').addEventListener('click', openScanner);
    const iframe = document.querySelector('iframe')
    iframe.addEventListener(
        'mouseover', () => overIframe = true
    );
    iframe.addEventListener(
        'mouseout', () => overIframe = false
    );
    window.addEventListener('blur', () => overIframe && closeScanner());
    // window.focus();
});
// window.addEventListener('load', () => {

// });
// const list = document.querySelector('ul#results');
function callback(results) {
    CameraScan.stopScan();
    let restartFlag = true;
    for (let d of results) {
        if (/^19[12]/.test(d[2])) continue;
        // window.alert("ISBN:" + d[2]);
        // window.location.href = "http://booklog.jp/blet?s=" + d[2];
        restartFlag = false;
        document.querySelector('iframe').src = "http://booklog.jp/blet?s=" + d[2];
        closeScanner();
        // const entry = document.createElement('li');
        // entry.appendChild(document.createTextNode(d.join(",")));//d[2] + ' (' + d[0] + ')'));
        // list.appendChild(entry);
        break;
    }
    if (restartFlag) CameraScan.restartScan();
}
const closeScanner = () => {
    document.querySelector('iframe').className = 'open';
    document.querySelector('#startScan').style = 'display:inline-block';
};
const openScanner = () => {
    document.querySelector('iframe').className = '';
    document.querySelector('#startScan').style = 'display:none';
    CameraScan.restartScan();
};