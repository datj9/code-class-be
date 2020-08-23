const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        definitions: {
            type: Array,
            required: true,
        },
        pronunciation: {
            type: String,
            required: true,
        },
        synonyms: Array,
        antonyms: Array,
        examples: Array,
        isRemembered: {
            type: Boolean,
            default: false,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    { timestamps: true }
);

WordSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Word = new mongoose.model("Word", WordSchema);

module.exports = Word;
