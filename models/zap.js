var mongoose = require("mongoose");

var zapSchema = mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    dateTime: { type: Date, required: true },
    location: { type: String, required: true }
});

// statics
zapSchema.statics.register = function(creator, message, dateTime, location, callback) {
    var zap = new Zap({
        creator: creator,
        message: message,
        dateTime: dateTime,
        location: location
    });
    zap.save(callback);
};

var Zap = mongoose.model("Zap", zapSchema);

exports.Zap = Zap;