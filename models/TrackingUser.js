const mongoose = require("mongoose");

const TrackingUserSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    country: String,
    city: String,
    tutorial: {
        type: mongoose.Types.ObjectId,
        ref: "Tutorial",
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    lastTimeSeen: {
        type: Number,
        default: Date.now(),
    },
    firstTimeSeen: {
        type: Number,
        default: Date.now(),
    },
});

TrackingUserSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const TrackingUser = new mongoose.model("TrackingUser", TrackingUserSchema);

module.exports = {
    TrackingUserSchema,
    TrackingUser,
};
