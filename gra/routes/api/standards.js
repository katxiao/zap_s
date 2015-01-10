var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../../utils/utils");

/* GET home page. */
router.get('/:category', function(req, res) {
    Standard.find({category: req.params.category}).exec(function (err, standards) {
        if (err) {
            res.statusCode(500);
            res.write(err);
            res.end();
        } else {
            res.json(standards);
            res.end();
        }
    });
});

router.post('/', function (req, res) {
    
});

module.exports = router;
