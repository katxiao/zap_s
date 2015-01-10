var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs-extra');
var Standard = require('../models/standard').Standard;

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var Client = require("../models/client").Client;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: "Green My Restaurant"}});
});

/* POST login user. */
router.post("/login", passport.authenticate("local-login"), function(req, res) {
    utils.sendSuccessResponse(res, {user: req.user});
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
    Client.find({username: username}, function(err, user) {
        if (err) {
            done(err);
        } else {
            done(null, user);
        }
    });
});

module.exports = router;
