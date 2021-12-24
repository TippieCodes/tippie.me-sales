var fs = require('fs'),
    http = require('http');

http.createServer(function (req, res) {
    let url = req.url.split("?")[0]
    console.log(url)

    if (url == "/auth") {
        fs.readFile(__dirname +"/auth.html", function (err,data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
        return;
    }
    if (url == '/') url = '/index'
    if (!url.includes('.')) url += '.html';

    fs.readFile(__dirname +"/front-end"+ url, function (err,data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(8080)