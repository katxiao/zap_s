var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../../utils/utils");
var Standard = require("../../models/standard").Standard;
var Client = require("../../models/client").Client;

/* GET a list of all standards */
router.get('/', function (req, res) {
    Standard.find({}).exec(function (err, standards) {
        if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
        res.statusCode = 200;
        res.json(standards);
        res.end();
    });
});

/* GET home page. */
router.get('/:category', function (req, res) {
    Standard.find({ category: req.params.category }).exec(function (err, standards) {
        if (err) {
            res.statusCode = 500;
            res.write(err);
            res.end();
        } else {
            res.statusCode = 200;
            res.json(standards);
            res.end();
        }
    });
});

router.put('/', utils.restrict, function (req, res) {
	console.log(req.body);
	var standardId = req.body.standardId;
	var selectedOption = req.body.selectedOption;
	var percentage = req.body.percentage;
	if (standardId === undefined || selectedOption === undefined || percentage === undefined) return utils.sendErrResponse(res, 400, 'Bad request: missing parameters');
	Standard.findOne( {_id: standardId}, function(err, standard) {
		if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
		if (!standard) return utils.sendErrResponse(res, 404, "Standard does not exist.");
		console.log('standard',standard);
		Client.findOne({_id: req.user[0]._id}, function(err, client) {
			if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
			var found = false;
			for (var i=0; i<client.GPs.length; i++) {
				if (client.GPs[i].question.toString() === standardId.toString()) {
					found = true;
					client.GPs[i].option = selectedOption;
					client.GPs[i].percentage = percentage;
				}
			}
			if (!found) {
				client.GPs.push({"question":standardId, "option": selectedOption, "percentage": percentage});
			}
			client.save();
			utils.sendSuccessResponse(res);
		})
	})
    
});

module.exports = router;
