var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        var extension = filename.substring(filename.length - 5);
        extension = extension.substring(extension.indexOf("."));
        if (extension === ".csv")
        {
            var directoryname = __dirname + "";
            directoryname = directoryname.substring(0, directoryname.length - 7);
            fs.readFile(filename, 'utf8', function (err, data) {
                if (err) throw err;
                console.log('OK: ' + filename);
                console.log(data)
            });
        }
        else {
            res.statusCode = 500;
            res.write("")
            res.end();
        }
    });
});

module.exports = router;
