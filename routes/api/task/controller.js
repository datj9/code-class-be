const { Task } = require("../../../models/Task");
const ObjectId = require("mongoose").Types.ObjectId;

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();

        tasks.forEach((task, i) => (tasks[i] = task.transform()));

        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createTask = async (req, res) => {
    const { name } = req.body;
    const errors = {};

    if (!name) errors.name = "name is required";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof name != "string") errors.name = "name is invalid";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    const newTask = new Task({
        name,
    });
    try {
        newTask.save();
        return res.status(200).json(newTask.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { isDone } = req.params;
    const errors = {};

    if (!ObjectId.isValid(id + "")) errors.id = "taskId is invalid";
    if (typeof isDone != "boolean") errors.isDone = "isDone is invalid";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        await Task.updateOne({ isDone });
        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTasks, createTask, updateTaskStatus };
