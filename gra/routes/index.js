var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs-extra');
var Standard = require('../models/standard').Standard;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function (req, res, next) {
    if (req.files) {
        console.log(util.inspect(req.files));
        if (req.files.myFile.size === 0) {
            return next(new Error("Hey, first would you select a file?"));
        }
        fs.exists(req.files.myFile.path, function (exists) {
            if (exists) {
                fs.readFile(req.files.myFile.path, 'utf8', function (err, data) {
                    data = data.trim();
                    var lines = data.split("\n");
                    for (var i in lines)
                    {
                        console.log("Line: ", lines[i]);
                        var standardData = lines[i].split(",");
                        if(standardData[0].trim() != "")
                        {
                            var optionsList = standardData[3].split(";;");
                            var gpsList = standardData[4].split(";;");
                            console.log(gpsList);
                            //var filtersList = standardData[6].split(";;");
                            if(optionsList.length === gpsList.length)
                            {
                                var options = [];
                                for(var index = 0; index < optionsList.length; index++)
                                    options.push({text: optionsList[index], points: Number(gpsList[index])});
                                var standard = new Standard({ category: standardData[0], item: "Don't have yet.", question: standardData[2], optionList: options });
                                standard.save();
                            }
                        }
                    }
                    res.end("Got your file!");
                });
            } else {
                res.end("Well, there is no magic for those who don’t believe in it!");
            }
        });
    }
});

module.exports = router;
