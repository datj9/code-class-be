const { Tutorial } = require("../../../models/Tutorial");
const { User } = require("../../../models/User");
const { TrackingUser } = require("../../../models/TrackingUser");
const isURL = require("validator/lib/isURL");
const ObjectId = require("mongoose").Types.ObjectId;
const isInt = require("validator/lib/isInt");
const isIP = require("validator/lib/isIP");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

const getTutorials = async (req, res) => {
    let tutorials;
    let total;
    const { pageSize, pageIndex, tags: tagsReq, sortBy, orderBy } = req.query;
    const limit = isInt(pageSize + "") ? parseInt(pageSize) : 8;
    const skip = isInt(pageIndex + "") ? (pageIndex - 1) * limit : 0;
    const sort = ["createdAt", "views", "difficultyLevel"].includes(sortBy) ? sortBy : "createdAt";
    const order = orderBy == 1 || orderBy == -1 ? parseInt(orderBy) : -1;
    let tags;
    try {
        tags = Array.isArray(JSON.parse(tagsReq)) ? JSON.parse(tagsReq) : undefined;
    } catch (error) {}

    try {
        if (tags && tags.length > 0) {
            tutorials = await Tutorial.find({ tags: { $in: tags } })
                .sort([[sort, order]])
                .skip(skip)
                .limit(limit);
            total = await Tutorial.countDocuments({ tags: { $in: tags } });
        } else {
            tutorials = await Tutorial.find()
                .sort([[sort, order]])
                .skip(skip)
                .limit(limit);
            total = await Tutorial.countDocuments();
        }
        tutorials.forEach((tutorial, i) => (tutorials[i] = tutorial.transform()));
        return res.status(200).json({ tutorials, total });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getTutorialById = async (req, res) => {
    const { tutorialId } = req.params;
    const { id } = req.user;

    if (!ObjectId.isValid(tutorialId + "")) return res.status(400).json({ error: "tutorialId is invalid" });
    try {
        const user = await User.findById(id);
        const tutorial = await Tutorial.findById(tutorialId);
        const isSaved = user ? user.savedTutorials.includes(tutorialId) : false;

        return res.status(200).json({
            ...tutorial.transform(),
            isSaved,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createTutorial = async (req, res) => {
    const { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags } = req.body;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (!tags) errors.tags = "tags is required";
    if (!difficultyLevel) errors.difficultyLevel = "difficultyLevel is required";
    if (!readingTime) errors.readingTime = "readingTime is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (
        typeof difficultyLevel != "number" ||
        !isInt(difficultyLevel + "") ||
        difficultyLevel > 4 ||
        difficultyLevel < 1
    ) {
        errors.difficultyLevel = "difficultyLevel is invalid";
    }
    if (typeof readingTime != "number" || readingTime < 1) errors.readingTime = "readingTime is invalid";
    if (!Array.isArray(tags)) errors.tags = "tags is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const newTutorial = new Tutorial({
        title,
        description,
        thumbnailUrl,
        content,
        difficultyLevel,
        readingTime,
        tags,
    });

    try {
        await newTutorial.save();
        return res.status(201).json(newTutorial.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateTutorial = async (req, res) => {
    const { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags } = req.body;
    const { tutorialId } = req.params;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (!difficultyLevel) errors.difficultyLevel = "difficultyLevel is required";
    if (!readingTime) errors.readingTime = "readingTime is required";
    if (!tags) errors.tags = "tags is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (
        typeof difficultyLevel != "number" ||
        !isInt(difficultyLevel + "") ||
        difficultyLevel > 4 ||
        difficultyLevel < 1
    ) {
        errors.difficultyLevel = "difficultyLevel is invalid";
    }
    if (typeof readingTime != "number" || readingTime < 1) errors.readingTime = "readingTime is invalid";
    if (!Array.isArray(tags)) errors.tags = "tags is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundTutorial = await Tutorial.findById(tutorialId);
        if (!foundTutorial) return res.status(404).json({ error: "Tutorial not found" });
        const tutorial = await Tutorial.findOneAndUpdate(
            { _id: tutorialId },
            { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags }
        );
        return res.status(200).json(tutorial.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const increaseView = async (req, res) => {
    const { tutorialId, ip, country, city } = req.body;
    const errors = {};

    if (!ObjectId.isValid(tutorialId + "")) errors.tutorialId = "tutorialId is invalid";
    if (!isIP(ip)) errors.ip = "ip is invalid";
    if (country && typeof country != "string") errors.country = "country is invalid";
    if (city && typeof city != "string") errors.city = "city is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundTracking = await TrackingUser.findOne({ ip, tutorial: tutorialId }).populate("tutorial");

        if (!foundTracking) {
            const newTracking = new TrackingUser({
                ip,
                tutorial: tutorialId,
                country,
                city,
            });
            await newTracking.save();
            await Tutorial.updateOne({ _id: tutorialId }, { $inc: { views: 1 } });

            return res.status(201).json({
                message: "Created successfully",
            });
        } else if ((Date.now() - foundTracking.lastTimeSeen) / 1000 / 60 > foundTracking.tutorial.readingTime / 8) {
            foundTracking.viwes = ++foundTracking.views;
            foundTracking.lastTimeSeen = Date.now();
            await foundTracking.save();
            await Tutorial.updateOne({ _id: tutorialId }, { $inc: { views: 1 } });

            return res.status(200).json({ message: "Updated successfully" });
        } else {
            foundTracking.lastTimeSeen = Date.now();
            await foundTracking.save();

            return res.status(200).json({ message: "Updated successfully" });
        }
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
    increaseView,
    deleteTutorial,
};
