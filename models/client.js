// Author: Jamar Brooks
var mongoose = require("mongoose");
//var request = require("request");
var utils = require("../utils/utils");

var clientSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    location: { State: { type: String }, City: { type: String }, ZipCode: { type: Number } },
    organization: { type: String },
    GPs: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" }, option: { type: Number }, percentage: { type: Number } }],
    VGPs: [{ category: { type: String }, question: { type: String }, option: { type: Number }}],
    recycling: { type: Boolean, default: false },
    styrofoam: { type: Boolean, default: false},
    nextsteps: { type: String, default: 'None Available' }
});

// statics
clientSchema.statics.register = function(username, password, location, organization, nextsteps, vgps, callback) {
    var client = new Client({
       username: username,
       password: password,
       location: location,
        organization: organization, 
        nextsteps: nextsteps,
       VGPs: vgps
    });
    client.save(callback);
};

clientSchema.statics.registerAdmin = function(callback) {
    var client = new Client({
        username: 'admin',
        password: 'admin',
        admin: true
    });
    client.save(callback);
}

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