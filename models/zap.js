var mongoose = require("mongoose");

var zapSchema = mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    dateTime: { type: Date, required: true },
    location: {latitude: Number, longitude: Number}
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

zapSchema.statics.insertDummyData = function(userId, callback) {
    var zap1 = new Zap({
        creator: userId,
        message: 'Oh hay.',
        dateTime: new Date(),
        location: {latitude: 42.357894, longitude: -71.093245}
    });
    zap1.save(callback);

    var zap2 = new Zap({
        creator: userId,
        message: 'Kat & G 5ever~',
        dateTime: new Date(),
        location: {latitude: 42.357894, longitude: -71.093245}
    });
    zap2.save(callback);

    var zap3 = new Zap({
        creator: userId,
        message: "oh snow you didn't.",
        dateTime: new Date(),
        location: {latitude: 42.357894, longitude: -71.093245}
    });
    zap3.save(callback);
}

var Zap = mongoose.model("Zap", zapSchema);

exports.Zap = Zap;