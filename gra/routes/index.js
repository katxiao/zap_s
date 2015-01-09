var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var Client = require("../models/client").Client;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {});
});

/* POST login user. */
router.post("/login", passport.authenticate("local-login"), function(req, res) {
    utils.sendSuccessResponse(res, {user: req.user});
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

// Passport strategy for logging in
passport.use("local-login", new LocalStrategy(function(username, password, done) {

    Client.login(username, password, function(err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, {message: "Invalid username/password"});
        } else {
            return done(null, user);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
    Client.findByUsername(username, function(err, user) {
        if (err) {
            done(err);
        } else {
            done(null, user);
        }
    });
});

module.exports = router;
