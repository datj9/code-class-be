const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema(
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
        technology: {
            type: String,
            required: true,
        },
        questions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Question",
            required: true,
        },
    },
    { timestamps: true }
);

TestSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Test = new mongoose.model("Test", TestSchema);

module.exports = {
    TestSchema,
    Test,
};
