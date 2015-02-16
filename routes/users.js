var express = require('express');
var router = express.Router();
//var fs = require('fs-extra');
var utils = require("../utils/utils");

var sendgrid = require("sendgrid")(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
var User = require("../models/user").User;
var Zap = require("../models/zap").Zap;


// -------------------
// URL: "/users/"
// -------------------
/*
    GET /users/
    Request body: None
    Response:
        - success: true if the server successfully retrieved list of users
        - content: on success, an object with a field 'users', containing a list of users
        - err: on failure, an error message
*/
router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        utils.sendSuccessResponse(res, {
            users: users
        });
    });
});

/*
    POST /users/
    Request body:
        - content: username, password, and confirm password fields of a desired user account
    Response:
        - success: true if the server successfully created a new user
        - err: on failure, an error message
 */
router.post('/', function(req, res) {
    if (req.session.user) {
        return utils.sendErrResponse(res, 403, 'There is already a user logged in.');
    }
    if (!(req.body.username && req.body.password)) {
        return utils.sendErrResponse(res, 400, 'Username or password not provided.');
    }
    User.find({
            'username': req.body.username
        },
        function(err, docs) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            if (docs.length > 0) {
                // Username alerady exists
                return utils.sendErrResponse(res, 400, 'That username is already taken!');
            } else {
                if (req.body.password !== req.body.confirm_password) {
                    return utils.sendErrResponse(res, 400, 'Passwords do not match!');
                }
                var u = new User({
                    username: req.body.username,
                    password: req.body.password,
                    favorites: [],
                    zaps: []
                });
                u.save(function(err, user) {
                    if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    return utils.sendSuccessResponse(res);
                });
            }
        });
});

/*
  PUT /users/
    404 error
*/
router.put('/', function(req, res) {
    return utils.sendErrResponse(res, 404, 'Resource not found.');
});

/*
  DELETE /users/
    404 error
*/
router.delete('/', function(req, res, next) {
    return utils.sendErrResponse(res, 404, 'Resource not found.');
});

/*
  GET /users/current
  No request parameters
  Response:
    - success.loggedIn: true if there is a user logged in; false otherwise
    - success.user: if success.loggedIn, the currently logged in user
*/
router.get('/current', function(req, res) {
    if (req.session.user) {
        utils.sendSuccessResponse(res, {
            loggedIn: true,
            user: req.session.user
        });
    } else {
        utils.sendSuccessResponse(res, {
            loggedIn: false
        });
    }
});

// -------------------
// URL: "/users/:id"
// -------------------
/*
    GET /users/:id
    Request body:
        - id: a String representation of a User ObjectId
    Response:
        - success: true if the server successfully retrieved a user
        - content: on success, an object representing the desired user
        - err: on failure, an error message
*/
router.get('/:id', function(req, res, next) {
    User.findOne({
        _id: req.params.id
    }).populate('favorites').populate('zaps').exec(function(err, user) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!user) return utils.sendErrResponse(res, 404, 'Resource not found.');
        delete user.password;
        return utils.sendSuccessResponse(res, {user: user});
    });
});

/*
  POST /users/:id
    404 error
*/
router.post('/:id', function(req, res, next) {
    return utils.sendErrResponse(res, 404, 'Resource not found.');
});

/*
    PUT /users/:id
    * @urlParam {User._id} user_id the id of the user to update
    * @urlParam {String} action the action (add or delete) to perform on the supplied user
    Request body:
        - id: a String representation of a Zap ObjectId
*/
router.put('/:id', function(req, res, next) {
    if (req.body.password === undefined || req.body.id === undefined) {
        return utils.sendErrResponse(res, 400, 'Not enough information provided for update.');
    }
    User.update({
        _id: req.body.id
    }, {
        $set: {
            password: req.body.password
        }
    }, function(err, user) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (user.length === 0) return utils.sendErrResponse(res, 404, 'Resource not found.');;
        return utils.sendSuccessResponse(res);
    });
});

/*
    PUT /users/:id/favorite
    Request body:
        - id: a String representation of a User ObjectId
        - content: String representing new desired user password
*/
router.put('/:id/favorite', function(req, res, next) {
    if (req.body.zapId === undefined) return utils.sendErrResponse(res, 400, 'Not enough information provided for update.');
    var zapId = req.body.zapId
    Zap.findOne({_id : zapId}).exec(function(err, zap) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!zap) return utils.sendErrResponse(res, 500, 'Zap does not exist.');
        User.findOne({ _id:req.params.id}).exec(function(err, user) {
            if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            if (!user) return utils.sendErrResponse(res, 500, 'User does not exist.');
            var index = user.favorites.indexOf(zapId);
            if (req.query.action === 'add') {
                if (index === -1) {
                    user.favorites.push(zapId);
                    user.save( function(err, user) {
                        if (err) return utils.sendErrResponse(res, 500, 'Error updating user favorites.');
                        return utils.sendSuccessResponse(res, {user: user});
                    })
                }
            }
            if (req.query.action === 'delete') {
                if (index !== -1) {
                    user.favorites.splice(index, 1);
                }
                user.save( function(err, user) {
                    if (err) return utils.sendErrResponse(res, 500, 'Error updating user favorites.');
                    return utils.sendSuccessResponse(res, {user: user});
                })
            }
        })
    })
})

/*
    DELETE /users/:id
    Request parameters:
        - id: a String representation of a User ObjectId
    Response:
        - success: true if the server successfully deleted a user
        - err: on failure, an error message
 */
router.delete('/:id', function(req, res, next) {
    User.remove({
        _id: req.params.id
    }, function(err, user) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (user.length === 0) return utils.sendErrResponse(res, 404, 'Resource not found.');
        //delete req.session.user;
        //req.session.user = undefined;
        req.session.destroy();
        return utils.sendSuccessResponse(res);
    });
});

router.post('/email', function(req, res) {
    var username = req.body.username;
    User.findOne({username: username}).exec(function(err, user) {
        if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
        if (!user) return utils.sendErrResponse(res, 500, "User with this email does not exist.");
        emailPasswordReset(username);
        utils.sendSuccessResponse(res, {});
    })
})

/**
 * Sends an email with a password reset link to the user.
 * Links to a password reset form
 */
function emailPasswordReset(username) {
    var link = "http://zap-kjx.rhcloud.com/user/confirm?username=" + utils.fromStringToHex(username);
    var mailContent = "Hi " + username + "!<br>"
        + "Click <a href=" + link + ">here</a> to confirm your email address.";

    var mailOptions = {
        to: email,
        from: process.env.SENDGRID_USERNAME,
        subject: "Zap - Confirm email address",
        html: mailContent
    };

    sendgrid.send(mailOptions, function(err, json) {
        // if (err) { return console.error(err); }
        // console.log(json);
    });
}

module.exports = router;
