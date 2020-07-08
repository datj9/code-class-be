const { Tutorial } = require("../../../models/Tutorial");
const isURL = require("validator/lib/isURL");
const ObjectId = require("mongoose").Types.ObjectId;

const getTutorials = async (req, res) => {
    try {
        const tutorials = await Tutorial.find();
        tutorials.forEach((tutorial, i) => (tutorials[i] = tutorial.transform()));
        return res.status(200).json(tutorials);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getTutorialById = async (req, res) => {
    const { tutorialId } = req.params;
    const { reqFromAd } = req.query;
    let tutorial;
    try {
        if (reqFromAd != "true") {
            tutorial = await Tutorial.findOneAndUpdate({ _id: tutorialId }, { $inc: { views: 1 } });
            return res.status(200).json(tutorial.transform());
        } else {
            tutorial = await Tutorial.findById(tutorialId);
            return res.status(200).json(tutorial.transform());
        }
    } catch (error) {}
};

const createTutorial = async (req, res) => {
    const { title, description, thumbnailUrl, content } = req.body;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const newTutorial = new Tutorial({
        title,
        description,
        thumbnailUrl,
        content,
    });

    try {
        await newTutorial.save();
        return res.status(201).json(newTutorial.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateTutorial = async (req, res) => {
    const { title, description, thumbnailUrl, content } = req.body;
    const { tutorialId } = req.params;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundTutorial = await Tutorial.findById(tutorialId);
        if (!foundTutorial) return res.status(404).json({ error: "Tutorial not found" });
        const tutorial = await Tutorial.findOneAndUpdate(
            { _id: tutorialId },
            { title, description, thumbnailUrl, content }
        );
        return res.status(200).json(tutorial.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteTutorial = async (req, res) => {
    const { tutorialId } = req.params;
    if (!ObjectId.isValid(tutorialId)) return res.status(400).json({ error: "tutorialId is invalid" });

    try {
        const tutorial = await Tutorial.findById(tutorialId);
        if (!tutorial) return res.status(400).json({ error: "Tutorial not found" });
        await Tutorial.deleteOne({ _id: tutorialId });
        return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    getTutorials,
    getTutorialById,
    createTutorial,
    updateTutorial,
    deleteTutorial,
};
