const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

chrome.webRequest.onHeadersReceived.addListener(
    details => ({
        responseHeaders: details.responseHeaders.filter(header =>
            !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase()))
    }),
    {
        urls: ['https://www.youtube.com/*']
    },
    ['blocking', 'responseHeaders']
);

window.addEventListener("message", function(event) {
    if (event.data.type && (event.data.type === "DOWNLOAD")) {
        chrome.downloads.download({
            url: event.data.url,
            filename: event.data.filename
        });
    }
});
