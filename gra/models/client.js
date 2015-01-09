// Author: Jamar Brooks
var mongoose = require("mongoose");
//var request = require("request");

var clientSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    location: { State: { type: String }, City: { type: String }, ZipCode: { type: Number }, required: true },
    GPs: [{ text: { type: ObjectId }, points: { type: Number }, required: true }],
    VGPs: [{ text: { type: String }, points: { type: Number }, required: true }],
});

// statics
clientSchema.statics.register = function(category, item, question, options, callback) {
    //var client = new Client({
    //    category: category,
    //    item: item,
    //    question: question,
    //    options: options
    //});
    //client.save(callback);
};

var Client = mongoose.model("Client", clientSchema);

// validation
var checkType = function (optionsList) {
    var valid = optionsList.length > 1;
    if (valid)
    {
        for (var i = 0; i < optionsList.length; i++) {
            if(optionsList[i].points <= 0) {
                valid = false;
                break;
            }
        }
    }
    return valid;
}

Client.schema.path("options").validate(checkType, "Must have at least two options and all options must have points values >= 0.");

exports.Client = Client;