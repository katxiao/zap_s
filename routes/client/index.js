var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../../utils/utils");

var sendgrid = require("sendgrid")(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
var Client = require("../../models/client").Client;
var Standard = require("../../models/standard").Standard;

/* GET all clients. */
router.get('/', function(req, res) {
    if (!req.user[0].admin) return utils.sendErrResponse(res, 401, 'Access denied: Admin only.');
    Client.find({}).exec(function(err, clients) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        for (var i = 0; i < clients.length; i++) {
            clients[i].password = undefined;
        }
        utils.sendSuccessResponse(res, {clients: clients});
    });
});

/* GET a client by Id */
router.get('/:id', function(req, res) {
    Client.findOne( {_id: req.params.id} ).exec(function(err, client) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!client) return utils.sendErrResponse(res, 500, 'Resource not found: Client does not exist.');
        delete client.password;
        utils.sendSuccessResponse(res, {client: client});
    })
});

/* PUT to change admin status of a user (only accessible by admins) */
router.put('/', function(req, res) {
    var admin = Boolean(req.body.admin);
    var id = req.body.clientId;
    if (!(admin === true || admin === false) || id === undefined) return utils.sendErrResponse(res, 400, 'Bad Request: invalid parameters.');
    if (!req.user[0].admin) return utils.sendErrResponse(res, 401, 'Access denied: Admin only.')
    Client.findOne({_id: id}).exec(function(err, client) {
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        if (!client) return utils.sendErrResponse(res, 500, 'Resource not found: Client does not exist.');
        client.admin = admin;
        client.save();
        utils.sendSuccessResponse(res, {});
    })
})

/**
 * POST registers client
 * @param {String} username the username of the new user
 * @param {String} password the password of the new user
 * @return {JSON} an object with a 'content.user' field, containing the new user
 * @error {400 Bad Request} if the username provided matches an existing user
 * @error {400 Bad Request} if the username is not a valid kerberos ID
 */
router.post("/", function(req, res) {

    var username = req.body.username;
    var password = req.body.password;
    var organization = req.body.organization;
    var state = req.body.state;
    var city = req.body.city;
    var zipcode = req.body.zipcode;

    if (username === undefined || password === undefined || organization === undefined || state === undefined || city === undefined || zipcode === undefined || typeof state !== "string" || typeof city !== "string" || typeof zipcode !== "number") return utils.sendErrResponse(res, 400, 'Bad Request: missing body parameter(s).')

    Client.findOne({username: username}, function(err, client) {
        
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');

        // user does not exist, create
        if (!client) {
            var location = {};
            location.State = state;
            location.City = city;
            location.ZipCode = zipcode;
            
            Client.register(username, password, location, organization, function(err, u) {
                if (err) return utils.sendErrResponse(res, 500, "Error saving new user.");
                // don't pass password to client side
                delete u.password;
                utils.sendSuccessResponse(res, {client: u});
            });

        // user already exists
        } else {
            utils.sendErrResponse(res, 400, "400: User already exists.");
        }
    });
});

/* reset user password */
router.post('/reset', function(req, res) {
    var username = req.body.username;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    console.log(req.body);
    if (username === undefined || oldPassword === undefined || newPassword === undefined) return utils.sendErrResponse(res, 400, "Bad request: missing body parameter(s)");
    Client.findOne( {username : username}).exec(function(err, client) {
        if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
        if (!client) return utils.sendErrResponse(res, 500, 'User does not exist.');
        if (oldPassword !== client.password) return utils.sendErrResponse(res, 401, "Incorrect user information!");
        client.password = newPassword;
        client.save(function(err, c) {
            return utils.sendSuccessResponse(res, {});
        });
    })
})

router.post('/email', function(req, res) {
    var username = req.body.username;
    Client.findOne({username: username}).exec(function(err, client) {
        if (err) return utils.sendErrResponse(res, 500, "An unknown error occurred.");
        if (!client) return utils.sendErrResponse(res, 500, "User with this email does not exist.");
        var name = client.organization ? client.organization : '';
        emailPasswordReset(name, username);
        utils.sendSuccessResponse(res, {});
    })
})

/**
 * Sends an email with a password reset link to the user.
 * Links to a password reset form
 */
function emailPasswordReset(username, email) {
    var link = "http://greenMyRestaurant.herokuapp.com/#/reset?username=" + utils.fromStringToHex(username);
    var mailContent = "Hi " + username + "!<br>"
        + "Click <a href=" + link + ">here</a> to reset your password.";

    var mailOptions = {
        to: email,
        from: process.env.SENDGRID_USERNAME,
        subject: "Green My Restaurant Password Reset",
        html: mailContent
    };

    sendgrid.send(mailOptions, function(err, json) {
        // if (err) { return console.error(err); }
        // console.log(json);
    });
}

module.exports = router;
