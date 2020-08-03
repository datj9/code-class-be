const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        isDone: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

TaskSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Task = new mongoose.model("Task", TaskSchema);

module.exports = {
    TaskSchema,
    Task,
};
