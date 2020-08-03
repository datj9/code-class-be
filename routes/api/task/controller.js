const { Task } = require("../../../models/Task");

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
        return res.status(201).json(newTask.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTasks, createTask };
