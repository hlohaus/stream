const script = document.createElement("script");
script.textContent = `
script = document.createElement("script");
script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.8.3/dist/ffmpeg.min.js';
script.onload = function () {
    script.remove();
}
document.documentElement.appendChild(script);

function getTitle()
{
    const meta = document.querySelector('meta[name="title"]');
    return meta ? meta.getAttribute('content') : '';
}

let mediaSources = new Array;
const sourceTypes = new WeakMap;
const sourceBuffers = new WeakMap;
const buffers = new WeakMap;

const nativeAddSourceBuffer = MediaSource.prototype.addSourceBuffer;
Object.defineProperty(MediaSource.prototype, 'addSourceBuffer', {
    value: (function(type) {
        const sourceBuffer = nativeAddSourceBuffer.call(this, type);
        sourceTypes.set(sourceBuffer, type);
        buffers.set(sourceBuffer, new Array);
        if (!sourceBuffers.has(this)) {
            mediaSources.push(this);
            sourceBuffers.set(this, new Array);
            this.addEventListener('sourceended', function(e) {
                download(this);
            }, false);
        }
        sourceBuffers.get(this).push(sourceBuffer);
        return sourceBuffer;
    }),
    configurable: false,
    writable: false,
});

const nativeAppendBuffer = SourceBuffer.prototype.appendBuffer;
Object.defineProperty(SourceBuffer.prototype, 'appendBuffer', {
    value: function(buffer) {
        buffers.get(this).push(buffer);
        return nativeAppendBuffer.call(this, buffer);
    },
    configurable: false,
    writable: false,
});

transcode = async (blob) => {
    const input = 'record.webm';
    const output = 'output.mp3';
    const ffmpeg = FFmpeg.createFFmpeg({ log: true });
    await ffmpeg.load();
    await ffmpeg.write(input, blob);
    await ffmpeg.transcode(input, output);
    const data = ffmpeg.read(output);
    return new Blob([data.buffer], { type: 'audio/mp3' });
}
download = function(newSource) {
    const newBuffers = sourceBuffers.get(newSource);
    sourceBuffers.delete(newSource);
    newBuffers.map(newBuffer => createDownload(newBuffer));
}
createDownload = function(sourceBuffer){
    const type = sourceTypes.get(sourceBuffer);
    sourceTypes.delete(sourceBuffer);
    const ownPuffers = buffers.get(sourceBuffer);
    buffers.delete(sourceBuffer);
    const blob = new Blob(ownPuffers, {type : type});

    createLink(blob);
    transcode(blob).then(function (blob) {
        createLink(blob)
    });
}
createLink = function(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getTitle();
    document.body.appendChild(link);
    link.click();
}
`;
document.documentElement.insertBefore(script, document.documentElement.firstChild);
script.remove();


