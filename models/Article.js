const mongoose = require("mongoose");
const { TechnologySchema } = require("./Technology");

const ArticleSchema = new mongoose.Schema(
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
        author: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        difficultyLevel: Number,
        readingTime: {
            type: Number,
            required: true,
        },
        technologies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Technology",
            },
        ],

        isTutorial: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

ArticleSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Article = new mongoose.model("Article", ArticleSchema);

module.exports = {
    ArticleSchema,
    Article,
};
