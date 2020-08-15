const { Mentor } = require("../../../models/Mentor");
const { User } = require("../../../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

const getMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find();

        mentors.forEach((m, i) => (mentors[i] = m.transform()));

        return res.status(200).json(mentors);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getOneMentor = async (req, res) => {
    const { mentorId } = req.params;
    if (!ObjectId.isValid(mentorId)) return res.status(400).json({ mentorId: "mentorId is valid" });

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        return res.status(200).json(mentor.transform());
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
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ userId: "userId is invalid" });
        const newMentor = new Mentor({
            user,
            numberOfYearsExperience,
            currentJob,
            specialities,
        });
        await newMentor.save();
        return res.status(201).json(newMentor.transform());
    } catch (error) {
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
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ userId: "userId is invalid" });

        await Mentor.updateOne({ _id: mentorId }, { user, numberOfYearsExperience, currentJob, specialities });

        return res.status(200).json(newMentor.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getMentors, getOneMentor, createMentor, updateMentor };
