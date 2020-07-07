const mongoose = require("mongoose");

const TutorialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

TutorialSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Tutorial = new mongoose.model("Tutorial", TutorialSchema);

module.exports = {
    TutorialSchema,
    Tutorial,
};
