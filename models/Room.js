const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    ],
    name: {
        type: String,
    },
    used: {
        // Room have at least one message or not
        type: Boolean,
        default: false,
        required: true,
    },
    lastTimeWorked: {
        type: Date,
        required: true,
        default: new Date(),
    },
});

RoomSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Room = new mongoose.model("Room", RoomSchema);

module.exports = {
    RoomSchema,
    Room,
};
