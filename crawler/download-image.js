let http = require('http'),
    fs = require('fs'),
    url = require('url')

module.exports = (_href, _filepath) => {
    const hrefStartsWithHttp = _href.indexOf('http') !== 0
    const href = hrefStartsWithHttp ? ('http://' + _href) : _href
    const parsedURL = url.parse(href)
    const filepath = _filepath || parsedURL.pathname.split('/').join('_')
    http.get({
        host: parsedURL.host,
        path: parsedURL.pathname
    }, function (res) {
        let chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk)
        })
        res.on('end', function () {
            const buffer = Buffer.concat(chunks)
            fs.writeFile(filepath, buffer,e=>e)
        })
    })
}
