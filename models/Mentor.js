const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        numberOfYearsExperience: {
            type: Number,
            required: true,
        },
        currentJob: {
            type: String,
            required: true,
        },
        specialities: {
            type: Array,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

MentorSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Mentor = new mongoose.model("Mentor", MentorSchema);

module.exports = {
    MentorSchema,
    Mentor,
};
