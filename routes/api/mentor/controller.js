const { Mentor } = require("../../../models/Mentor");
const { User } = require("../../../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

const getMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find().populate("user");

        mentors.forEach((m, i) => {
            mentors[i] = m.transform();
            mentors[i].user = m.user.transform();
            delete mentors[i].user.password;
            delete mentors[i].user.savedTutorials;
            delete mentors[i].user.tasks;
        });

        return res.status(200).json(mentors);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getActiveMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find({ isActive: true }).populate("user");

        mentors.forEach((m, i) => {
            mentors[i] = m.transform();
            mentors[i].user = m.user.transform();
            delete mentors[i].user.password;
            delete mentors[i].user.savedTutorials;
            delete mentors[i].user.tasks;
        });

        return res.status(200).json(mentors);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getOneMentor = async (req, res) => {
    const { mentorId } = req.params;
    let returnMentor;
    if (!ObjectId.isValid(mentorId)) return res.status(400).json({ mentorId: "mentorId is valid" });

    try {
        const mentor = await Mentor.findById(mentorId).populate("user");
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });
        returnMentor = mentor.transform();
        returnMentor.user = mentor.user.transform();
        delete returnMentor.user.password;
        delete returnMentor.user.savedTutorials;
        delete returnMentor.user.tasks;

        return res.status(200).json(returnMentor);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getOneActiveMentor = async (req, res) => {
    const { mentorId } = req.params;
    let returnMentor;
    if (!ObjectId.isValid(mentorId)) return res.status(400).json({ mentorId: "mentorId is valid" });

    try {
        const mentor = await Mentor.findById(mentorId).populate("user");
        if (!mentor || !mentor.isActive) return res.status(404).json({ error: "Mentor not found" });
        returnMentor = mentor.transform();
        returnMentor.user = mentor.user.transform();
        delete returnMentor.user.password;
        delete returnMentor.user.savedTutorials;
        delete returnMentor.user.tasks;

        return res.status(200).json(returnMentor);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createMentor = async (req, res) => {
    const { userId, numberOfYearsExperience, currentJob, specialities } = req.body;
    const errors = {};
    const validatedFields = ["userId", "numberOfYearsExperience", "currentJob", "specialities"];
    const regExpTestJob = RegExp(
        "Front-end Developer|Back-end Developer|Web Developer|Mobile Developer|Full-stack Developer"
    );

    validatedFields.forEach((field) => {
        if (!req.body[field]) errors[field] = `${field} is required`;
    });
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (!ObjectId.isValid(userId)) errors.userId = "userId is invalid";
    if (typeof numberOfYearsExperience != "number" || numberOfYearsExperience % 0.5 != 0) {
        errors.numberOfYearsExperience = "numberOfYearsExperience is invalid";
    }
    if (typeof currentJob != "string" || !regExpTestJob.test(currentJob)) {
        errors.currentJob = "currentJob is invalid";
    }
    if (!Array.isArray(specialities) || [...new Set(specialities)].length != specialities.length) {
        errors.specialities = "specialities is invalid";
    }
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const user = await User.findById(userId).select(["_id", "email", "name"]);
        if (!user) return res.status(400).json({ userId: "user not found" });
        const newMentor = new Mentor({
            user,
            numberOfYearsExperience,
            currentJob,
            specialities,
        });
        await newMentor.save();
        await User.updateOne({ _id: userId }, { userType: "mentor" });

        return res.status(201).json({
            ...newMentor.transform(),
            user: {
                ...user.transform(),
                userType: "mentor",
            },
        });
    } catch (error) {
        if (error.code == 11000) return res.status(400).json({ userId: "this user has already been mentor" });
        return res.status(500).json(error);
    }
};

const updateMentor = async (req, res) => {
    const { userId, numberOfYearsExperience, currentJob, specialities } = req.body;
    const { mentorId } = req.params;
    const errors = {};
    const validatedFields = ["userId", "numberOfYearsExperience", "currentJob", "specialities"];
    const regExpTestJob = RegExp(
        "Front-end Developer|Back-end Developer|Web Developer|Mobile Developer|Full-stack Developer"
    );

    if (!ObjectId.isValid(mentorId)) errors.mentorId = "mentorId is invalid";

    validatedFields.forEach((field) => {
        if (!req.body[field]) errors[field] = `${field} is required`;
    });
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (!ObjectId.isValid(userId + "")) errors.userId = "userId is invalid";
    if (typeof numberOfYearsExperience != "number" || numberOfYearsExperience % 0.5 != 0) {
        errors.numberOfYearsExperience = "numberOfYearsExperience is invalid";
    }
    if (typeof currentJob != "string" || !regExpTestJob.test(currentJob)) {
        errors.currentJob = "currentJob is invalid";
    }
    if (!Array.isArray(specialities) || [...new Set(specialities)].length != specialities.length) {
        errors.specialities = "specialities is invalid";
    }
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ userId: "userId is invalid" });

        await Mentor.updateOne({ _id: mentorId }, { user, numberOfYearsExperience, currentJob, specialities });

        return res.status(200).json({ message: "Updated mentor successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteMentor = async (req, res) => {
    const { mentorId } = req.params;

    if (!ObjectId.isValid(mentorId)) return res.status(400).json({ mentorId: "mentorId is invalid" });

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        await Mentor.deleteOne({ _id: mentorId });
        return res.status(200).json({ message: "Deleted mentor successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateIsActiveOfMentor = async (req, res) => {
    const { mentorId } = req.params;
    const { isActive } = req.body;
    const errors = {};

    if (!ObjectId.isValid(mentorId)) errors.mentorId = "mentorId is invalid";
    if (typeof isActive != "boolean") errors.isActive = "isActive is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        await Mentor.updateOne({ _id: mentorId }, { isActive });
        return res.status(200).json({ message: "Updated isActive successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    getMentors,
    getActiveMentors,
    getOneMentor,
    getOneActiveMentor,
    createMentor,
    updateMentor,
    deleteMentor,
    updateIsActiveOfMentor,
};
