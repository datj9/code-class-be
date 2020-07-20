const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    answers: {
        type: [String],
        required: true,
    },
    correctAnswer: {
        type: Number,
        required: true,
    },
    explaination: String,
});

QuestionSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Question = new mongoose.model("Question", QuestionSchema);

module.exports = {
    QuestionSchema,
    Question,
};
