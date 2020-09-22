const mongoose = require("mongoose");
const { TaskSchema } = require("./Task");
const { WordSchema } = require("./Word");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    shortName: {
        type: String,
        required: true,
    },
    phoneNumber: String,
    dateOfBirth: Date,
    userType: {
        type: String,
        default: "client",
    },
    profileImageURL: String,
    savedArticles: [{ type: mongoose.Types.ObjectId, ref: "Article" }],
    tasks: {
        type: [TaskSchema],
        default: [],
    },
});

UserSchema.method("transform", function () {
    let obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    delete obj.password;
    delete obj.tasks;
    delete obj.savedTutorials;

    return obj;
});

const User = new mongoose.model("User", UserSchema);

module.exports = {
    UserSchema,
    User,
};
