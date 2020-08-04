const { Task } = require("../../../models/Task");
const { User } = require("../../../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

const getTasks = async (req, res) => {
    const { id } = req.user;

    try {
        const user = await User.findById(id);
        const tasks = user.tasks;

        tasks.forEach((task, i) => (tasks[i] = task.transform()));

        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createTask = async (req, res) => {
    const { name } = req.body;
    const { id } = req.user;
    const errors = {};

    if (!name) errors.name = "name is required";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof name != "string") errors.name = "name is invalid";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    const newTask = new Task({
        name,
    });
    try {
        const user = await User.findById(id);

        user.tasks.push(newTask);
        await user.save();

        return res.status(201).json(newTask.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateTaskStatus = async (req, res) => {
    const { id: taskId } = req.params;
    const { id: userId } = req.user;
    const { isDone } = req.body;
    const errors = {};

    if (!ObjectId.isValid(taskId + "")) errors.id = "taskId is invalid";
    if (typeof isDone != "boolean") errors.isDone = "isDone is invalid";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        await User.updateOne({ _id: userId, "tasks._id": taskId }, { $set: { "tasks.$.isDone": isDone } });

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteTask = async (req, res) => {
    const { id: taskId } = req.params;
    const { id: userId } = req.user;

    if (!ObjectId.isValid(taskId + "")) return res.status(400).json({ id: "taskId is invalid" });
    try {
        // const task = await Task.findById(id);

        // if (!task) return res.status(404).json({ error: "Task not found" });
        await User.updateOne({ _id: userId, "tasks._id": taskId }, { $pull: { tasks: { _id: taskId } } });

        return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTasks, createTask, updateTaskStatus, deleteTask };
