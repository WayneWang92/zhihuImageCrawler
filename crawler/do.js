const http = require('http'),
    https = require('https'),
    url = require("url"),
    fs = require("fs");

module.exports = (img_url,filepath,count) => {
    img_req_options = {
        hostname: '',
        port: 80,
        path: '/',
        agent: false,
        headers: {
            'accept-encoding': 'gzip, deflate',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36',
            'host': ''
        }
    }
    var url_info = url.parse(img_url);

    img_req_options.hostname = url_info.host;
    img_req_options.path = url_info.pathname;
    img_req_options.headers.host = url_info.host;

    var paths = url_info.pathname.split('/');
    var img_name = paths[paths.length - 1];

    if (url_info.protocol == 'http:') {
        if (url_info.port) {
            img_req_options.port = url_info.port;
        } else {
            img_req_options.port = 80;
        }
        http.get(img_req_options, (res) => {
            // Do stuff with response
            if (res.statusCode != 200) {
                console.log('Failed download: ');
                console.log('Path: ' + img_req_options.path);
                console.log('StatusCode: ' + res.statusCode);
            } else {
                var fsWriter = fs.createWriteStream(`${filepath}`);

                var html = "";
                res.on('data', (d) => {
                    fsWriter.write(d);
                });

                res.on('end', () => {
                    fsWriter.end();
                });

                fsWriter.on('finish', () => {
                    console.log(`${img_url} done`)
                });
            }
        });
    } else if (url_info.protocol == 'https:') {
        if (url_info.port) {
            img_req_options.port = url_info.port;
        } else {
            img_req_options.port = 443;
        }
        https.get(img_req_options, (res) => {
            // Do stuff with response
            if (res.statusCode != 200) {
                console.log('Failed download: ');
                console.log('    Path: ' + img_req_options.path);
                console.log('    StatusCode: ' + res.statusCode);
            } else {
                var fsWriter = fs.createWriteStream(`${filepath}`);

                var html = "";
                res.on('data', (d) => {
                    fsWriter.write(d);
                });

                res.on('end', () => {
                    fsWriter.end();
                });

                fsWriter.on('finish', () => {
                    console.log(`${img_url} done`)
                });
            }
        });
    }

}
