var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../../utils/utils");
var Standard = require("../models/standard").Standard;

/* GET a list of all standards */
router.get('/', function(req, res) {
	Standard.find({}).exec(function(err, standards) {
	  	if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
	    utils.sendSuccessResponse(res, {standards: standards});
	});
});

router.post('/', function (req, res) {
    
});

module.exports = router;
