var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../utils/utils");
var Zap = require("../models/zap").Zap;
var User = require("../models/user").User;


/*
    GET /zaps/
    Request body: None
    Response:
        - success: true if the server successfully retrieved list of all zaps
        - content: on success, an object containing a list of zaps
        - err: on failure, an error message
*/
router.get('/', function(req, res) {
    Zap.find({}).sort({date:-1}).populate('creator').exec(function(err, zaps) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        // TODO: filter by location
        return utils.sendSuccessResponse(res, zaps);
    })
});

/*
    POST /zaps/
    Request body:
        - content: None
    Response:
        - success: true if the server successfully created a new zap
        - err: on failure, an error message
 */
router.post('/', function(req, res, next) {
    if (req.body.creator === undefined || req.body.message === undefined || req.body.location === undefined) return utils.sendErrResponse(res, 400, 'Bad request: missing fields.');
    var Zap = Zap({
        creator: req.body.creator,
        message: req.body.message,
        dateTime: new Date(),
        location: req.body.location
    });

    User.findOne({_id:req.body.creator}).exec(function(err, user){
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!user) return utils.sendErrResponse(res, 500, 'User does not exist.');
        Zap.save(function(err, zap) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            user.zaps.push(zap._id);
            user.save();
            return utils.sendSuccessResponse(res, {});
        });
    })
});

/*
  PUT /zaps/
    404 error
*/
router.put('/', function(req, res, next) {
    return utils.sendErrResponse(res, 404, 'Resource not found.');
});

/*
    DELETE /zaps/
    Request parameters: None
    Response:
        - success: true if the server successfully deleted all zaps created by the current user
        - err: on failure, an error message
 */
router.delete('/', function(req, res, next) {
    if (req.body.id === undefined) return utils.sendErrResponse(res, 400, 'Bad request: missing fields.');
    var userId = req.body.id;
    User.findOne({
        _id: userId
    }, function(err, user) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        Zap.remove({
            _id: {
                $in: user.zaps
            }
        }).exec(function(err, zaps) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        });
        user.zaps = [];
        user.save(function(err, data) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            return utils.sendSuccessResponse(res, {});
        });
    });
});

// GET a zap
router.get('/:id', function(req, res) {
    Zap.findOne({
        _id: req.params.id
    }).populate('creator').exec(function(err, zap) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!zap) return utils.sendErrResponse(res, 404, 'Resource not found.');
        return utils.sendSuccessResponse(res, {zap: zap});
    });
});

//404 Error
router.post('/:id', function(req, res, next) {
    return utils.sendErrResponse(res, 404, 'Resource not found.');
});

//Update zap if exists. Otherwise, 404 Error
router.put('/:id', function(req, res, next) {
    if (req.body.message === undefined) return utils.sendErrResponse(res, 400, 'Bad request: missing fields.');
    var message = req.body.message
    Zap.update({
        _id: req.params.id
    }, {
        $zap: {
            message: message
        }
    }, function(err, zap) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!zap) return utils.sendErrResponse(res, 404, 'Resource not found.');
        return utils.sendSuccessResponse(res, {});
    });
});

//TODO: uses sessions
//Delete zap, 401 Error
router.delete('/:id', function(req, res, next) {
    Zap.findOne({
        _id: req.params.id
    }, function(err, zap) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!zap) return utils.sendErrResponse(res, 404, 'Resource not found.');
        if (zap.creator.toString() !== req.session.user.id) return utils.sendErrResponse(res, 400, 'Access denied!');
        Zap.remove({
            _id: req.params.id
        }, function(err, zap) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            User.findOne({
                _id: req.session.user.id
            }, function(err, user) {
                var index = user.zaps.indexOf(req.params.id);
                if (index !== -1) {
                    user.zaps.splice(index, 1);
                    user.save();
                }
            });
            return utils.sendSuccessResponse(res, {});
        });
    });
});

module.exports = router;
