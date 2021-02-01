
function getTitle()
{
    const meta = document.querySelector('meta[name="title"]');
    return meta ? meta.getAttribute('content') : '';
}

let mediaSource;
let mediaSources = new Array;
const sourceTypes = new WeakMap;
const sourceBuffers = new WeakMap;
const buffers = new WeakMap;

transcode = async (blob) => {
    const input = 'record.webm';
    const output = 'output.mp3';
    const ffmpeg = createFFmpeg({ log: true });
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

newSource = mediaSources.shift();
download(newSource);
