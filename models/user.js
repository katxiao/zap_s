var mongoose = require("mongoose");
var utils = require("../utils/utils");

var userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zap'
    }],
    zaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zap'
    }]
});

// statics
userSchema.statics.register = function(username, password, callback) {
    var user = new User({
       username: username,
       password: password,
       favorites: [],
       zaps: []
    });
    user.save(callback);
};

userSchema.statics.registerAdmin = function(callback) {
    var user = new User({
        username: 'admin',
        password: 'admin',
        favorites: [],
        zaps: []
    });
    user.save(callback);
}

userSchema.statics.login = function(username, password, callback) {
    User.findOne({username: username, password: password}, {password: 0}).exec(callback);
}

var User = mongoose.model("User", userSchema);

exports.User = User;