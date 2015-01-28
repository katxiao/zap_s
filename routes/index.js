var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs-extra');
var mongoose = require('mongoose');
var Standard = require('../models/standard').Standard;

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var utils = require("../utils/utils");
var Client = require("../models/client").Client;

/* GET home page. */
router.get('/list', function (req, res) {
    res.render('index', { title: "Green My Restaurant"});
});

router.get('/gui', function (req, res) {
    res.render('gui', {});
})

router.get('/', function (req, res) {
    res.render('home', {});
})

/* POST login user. */
router.post("/login", passport.authenticate("local-login"), function(req, res) {
    utils.sendSuccessResponse(res, {user: req.user});
});

/* GET current user */
router.get("/current_auth", function(req, res) {
    if (req.user) {
        var user = req.user[0];
        delete user.password
        return utils.sendSuccessResponse(res, {user: user});
    }
    return utils.sendSuccessResponse(res, {user: undefined});
})

router.get("/logout", function(req, res) {
    req.logout();
    utils.sendSuccessResponse(res, {});
})

router.post('/upload', function (req, res, next) {
    if (req.files) {
        //console.log(util.inspect(req.files));
        if (req.files.myFile.size === 0) {
            return next(new Error("Hey, first would you select a file?"));
        }
        fs.exists(req.files.myFile.path, function (exists) {
            if (exists) {
                fs.readFile(req.files.myFile.path, 'utf8', function (err, data) {
                    data = data.trim();
                    var lines = data.split("\n");
                    console.log("Line: ", lines.splice(0, 1));
                    Standard.find({category: lines[0].split(",")[0]}).exec(function (err, existingStandards) {
                        var latestMatched = 0;
                        var uploadId = Math.round(Math.random() * 10000);
                        for (var i in lines) {
                            //console.log(lines[i]);
                            var standardData = lines[i].split(",");
                            var existence = alreadyExists(existingStandards, standardData[2], standardData[3], latestMatched);
                            //console.log(existence);
                            if (standardData[0].trim() != "" && !existence.found) {
                                //console.log(standardData[3]);
                                if (standardData.length > 16) {
                                    var optionsList = standardData[3].split(";;");
                                    var gpsList = standardData[4].split(";;");
                                    var legislationZips = standardData[9].split(";;");
                                    var rebateZips = standardData[11].split(";;");
                                    var filters = standardData[15].split(";;");
                                    //console.log(filters);
                                    //console.log(optionsList.length, gpsList.length);
                                    if (optionsList.length > 0 && optionsList.length === gpsList.length) {
                                        var options = [];
                                        for (var index = 0; index < optionsList.length; index++) {
                                            //console.log(gpsList[index], Number(gpsList[index]));
                                            options.push({ text: optionsList[index], points: Number(gpsList[index]) });
                                        }
                                        //options.push({ text: optionsList[index], points: Number(gpsList[index]) });
                                        var standard = new Standard({ category: standardData[0], item: standardData[6], question: standardData[2], optionList: options, room: standardData[5], ecofacts: standardData[12], legislation: { message: standardData[8], zipCodes: legislationZips }, rebateincentives: { message: standardData[10], zipCodes: rebateZips }, solutions: standardData[13], filters: filters });
                                        standard.save(function (err) { console.log(err); });
                                    }
                                }
                            } else {
                                latestMatched = existence.latestMatched;
                            }
                        }
                        removeOldStandards(existingStandards, existence.latestMatched);
                        res.end("Got your file!");
                    });
                });
            } else {
                res.end("Well, there is no magic for those who don’t believe in it!");
            }
        });
    }
});

router.post('/uploadusers', function (req, res, next) {
    if (req.files) {
        if (req.files.myFile.size === 0) {
            return next(new Error("Hey, first would you select a file?"));
        }
        fs.exists(req.files.myFile.path, function (exists) {
            if (exists && req.files.myFile.path.substring(req.files.myFile.path.length - 3, req.files.myFile.path.length) === 'csv') {
                console.log('valid');
                fs.readFile(req.files.myFile.path, 'utf8', function (err, data) {
                    data = data.trim();
                    var lines = data.split("\n");
                    console.log("Line: ", lines.splice(0, 1));
                    for (var i in lines) {
                        //console.log(lines[i]);
                        var standardData = lines[i].split(",");
                        if (standardData[0].trim() !== "") {
                            //console.log(standardData[3]);
                            if (standardData.length > 16) {
                                var locationObj = {State: standardData[2], City: standardData[3], ZipCode: standardData[4]};
                                var client = new Client({ username: standardData[0], password: standardData[7], organization: standardData[0], location: locationObj, room: standardData[5], ecofacts: standardData[13], legislation: { message: standardData[9], zipCodes: legislationZips }, rebateincentives: { message: standardData[11], zipCodes: rebateZips }, solutions: standardData[14], filters: filters });
                                client.save(function (err) { console.log(err); });
                                var answersByCategory = standardData[12].split('|');
                                for (var index in answersByCategory) {
                                    var answers = answersByCategory[index].split(';');
                                    var category = answers.splice(0, 1).split(":")[0].trim();
                                    for (var i in answers) {
                                        var question = answers[i].split(':')[0].trim();
                                        var value = answers[i].split(':')[1].trim();
                                    }
                                }
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

var alreadyExists = function (existingStandards, question, options, latestMatched) {
    for (var index = latestMatched; index < existingStandards.length; ++index) {
        if(existingStandards[index].question === question)
        {
            existingStandards[index].matched = true;
            if (options && existingStandards[index].optionList.length === options.split(";;").length) {
                var latest = (index === latestMatched) ? latestMatched + 1 : latestMatched;
                return { found: true, latestMatched: latest };
            }
            var latest = (index === latestMatched) ? latestMatched + 1 : latestMatched;
            return { found: false, latestMatched: latest };
        }
    }
    return { found: false, latestMatched: latestMatched };
};

var removeOldStandards = function (existingStandards, latestMatched) {
    //console.log(latestMatched);
    for (var index = latestMatched; index < existingStandards.length; ++index) {
        if (!existingStandards[index].matched)
            Standard.findByIdAndRemove(existingStandards[index]._id);
    }
}

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
