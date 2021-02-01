
const nativeCreateObjectURL = URL.createObjectURL;
let urlToBlob = {};
Object.defineProperty(URL, 'createObjectURL', {
    value: (function(blob) {
        const url = nativeCreateObjectURL(blob);
        blob.addEventListener('onsourceclose', function (e) {
            //console.log(url, e);
            //window.postMessage({ type: "DOWNLOAD", url: url, filename: getTitle() }, "*");
        }, true);
        urlToBlob[url] = blob;
        return url;
    }),
    configurable: false,
    writable: false,
});


let workers = new Array;
function next()
{
    const newSource = mediaSources.shift();
    if (newSource) {
        mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', function() {
            const newBuffers = sourceBuffers.get(newSource);
            workers = newBuffers.map(newBuffers => createWorker(newBuffers));
            mediaSources.shift();
            workers.forEach(worker => worker());
            video.play();
        });
    }
}

function createWorker(sourceBuffer)
{
    const type = sourceTypes.get(sourceBuffer);
    const ownSourceBuffer = mediaSource.addSourceBuffer(type);
    const worker = function() {
        let ownPuffers = buffers.get(sourceBuffer);
        if (!ownPuffers.length) {
            return;
        }
        ownSourceBuffer.appendBuffer(ownPuffers.shift());
    };
    ownSourceBuffer.addEventListener('updateend', worker);
    return worker;
}


// const video = document.createElement("video");
// video.width = 320;
// video.height = 240;
// video.controls = true;
//
// document.addEventListener('DOMContentLoaded', (e) => {
//     document.body.append(video);
// });
Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
    get: function currentTime() {
        return 10000000000;
    }
});