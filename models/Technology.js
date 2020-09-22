const mongoose = require("mongoose");

const TechnologySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

TechnologySchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Technology = new mongoose.model("Technology", TechnologySchema);

module.exports = {
    TechnologySchema,
    Technology,
};
