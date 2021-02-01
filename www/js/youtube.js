// Code from https://developers.facebook.com/docs/javascript/quickstart/v2.2
// https://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension
;(function() {
    function facebook() {
        // your main code here
        window.fbAsyncInit = function () {
            FB.init({
                appId: '705882293613048',
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v8.0'
            });
            FB.ui({
                display: 'popup',
                method: 'live_broadcast',
                phase: 'create'
            }, (createRes) => {
                console.log(createRes);
                FB.ui({
                    display: 'popup',
                    method: 'live_broadcast',
                    phase: 'publish',
                    broadcast_data: createRes
                }, (publishRes) => {
                    console.log(publishRes);
                });

                stream('ws://localhost:3000/rtmp/' +
                    encodeURIComponent(createRes.stream_url));
            });
        };
    }

    function inject(fn) {
        const script = document.createElement('script')
        script.text = `(${fn.toString()})();`
        document.documentElement.appendChild(script)
    }

    //inject(facebook)
})();

function stream(url) {
    const ws = new WebSocket(url);
    let mediaRecorder;

    ws.addEventListener('open', (e) => {
        console.log('WebSocket Open', e);
        let mediaVideo = document.querySelector('.html5-video-container');
        if (!mediaVideo) {
            return;
        }

        let mediaStream = mediaVideo.captureStream(30); // 30 FPS
        mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/webm;codecs=h264',
            videoBitsPerSecond: 3000000
        });

        mediaRecorder.addEventListener('dataavailable', (e) => {
            ws.send(e.data);
        });

        mediaRecorder.addEventListener('stop', ws.close.bind(ws));

        mediaRecorder.start(1000);
    });

    ws.addEventListener('close', (e) => {
        console.log('WebSocket Close', e);
        mediaRecorder.stop();
    });
}

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    js.defer = true;
    js.crossorigin = "anonymous";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
