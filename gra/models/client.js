// Author: Jamar Brooks
var mongoose = require("mongoose");
//var request = require("request");

var clientSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    location: { State: { type: String }, City: { type: String }, ZipCode: { type: Number }},
    GPs: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" }, option: { type: Number }, percentage: {type: Number}}],
    VGPs: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" }, option: { type: Number }, percentage: {type: Number}}],
});

// statics
clientSchema.statics.register = function(username, password) {
    var client = new Client({
       username: username,
       password: password
    });
    client.save(function(err, c) {
    });
};

clientSchema.statics.login = function(username, password, callback) {
    Client.findOne({username: username, password: password}, {password: 0}).exec(callback);
}

var Client = mongoose.model("Client", clientSchema);

// validation
var checkType = function (location) {
    return location && location.State && location.City && location.ZipCode;
}

//TODO: client schema has no "location" path?
//Client.schema.path("location").validate(checkType, "Location must have state, city, and zipcode.");

exports.Client = Client;