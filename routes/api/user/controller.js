const bcrypt = require("bcryptjs");
const validator = require("validator");
const { User } = require("../../../models/User");
const { Mentor } = require("../../../models/Mentor");
const { promisify } = require("util");
const { Tutorial } = require("../../../models/Tutorial");
const ObjectId = require("mongoose").Types.ObjectId;
const hashPass = promisify(bcrypt.hash);
const dayjs = require("dayjs");
const createToken = require("../../../utils/createToken");

const updateUserInfo = async (req, res) => {
    const validatedFields = ["name"];
    const reqBody = req.body;
    const { name, phoneNumber, dateOfBirth, profileImageURL } = reqBody;
    const { email } = req.user;
    const errors = {};
    let shortName;

    for (let field of validatedFields) {
        if (!reqBody[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof name != "string") errors.name = "name is invalid";
    if (phoneNumber && !validator.isMobilePhone(phoneNumber + "", "vi-VN")) {
        errors.phoneNumber = "phoneNumber is invalid";
    }
    if (dateOfBirth && !validator.isDate(dayjs(dateOfBirth).format("YYYY/MM/DD"))) {
        errors.dateOfBirth = "dateOfBirth is invalid";
    }
    if (profileImageURL && !validator.isURL(profileImageURL + "")) {
        errors.profileImageURL = "profileImageURL is invalid";
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        shortName = name.trim().split(" ")[0][0] + name.trim().split(" ")[name.trim().split(" ").length - 1][0];

        await User.updateOne(
            { email },
            {
                name,
                shortName,
                phoneNumber,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                profileImageURL,
            }
        );
        const { id, userType } = user;
        if (userType != "mentor") {
            const token = await createToken({
                id,
                email,
                name,
                shortName,
                userType,
                phoneNumber,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                profileImageURL,
            });
            return res.status(200).json({ token });
        } else {
            let mentor = await Mentor.findOne({ user: id });
            mentor = mentor.transform();
            mentor.mentorId = mentor.id;
            const token = await createToken({
                id,
                email,
                name,
                shortName,
                userType,
                phoneNumber,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                profileImageURL,
                ...mentor,
            });
            return res.status(200).json({ token });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.user;
    const errors = {};
    const validatedFields = ["currentPassword", "newPassword", "confirmPassword"];

    for (const field of validatedFields) {
        if (!req.body[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof currentPassword != "string") errors.currentPassword = "currentPassword is invalid";
    if (typeof newPassword != "string") errors.newPassword = "newPassword is invalid";
    if (typeof confirmPassword != "string") errors.confirmPassword = "confirmPassword is invalid";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const user = await User.findById(id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ currentPassword: "currentPassword is not correct" });
        }

        if (newPassword.length < 8)
            return res.status(400).json({ newPassword: "newPassword must have at least 8 characters" });
        if (confirmPassword !== newPassword)
            return res.status(400).json({ confirmPassword: "confirmPassword does not match" });

        const hash = await hashPass(newPassword, 10);
        await User.updateOne({ _id: id }, { password: hash });

        return res.status(200).json({ message: "Change password successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const addTutorial = async (req, res) => {
    const { tutorialId } = req.query;
    const { id } = req.user;

    if (!ObjectId.isValid(tutorialId)) return res.status(400).json({ error: "tutorialId is invalid" });

    try {
        const foundTutorial = await Tutorial.findById(tutorialId);
        if (!foundTutorial) return res.status(404).json({ error: "Tutorial not found" });

        const user = await User.findById(id).select("-password");
        const { userType, email, name, phoneNumber, dateOfBirth, profileImageURL } = user;
        const foundIndex = user.savedTutorials.findIndex((tutorial) => tutorial == tutorialId);
        if (foundIndex == -1) {
            user.savedTutorials.push(tutorialId);
            await user.save();
            const newToken = await createToken({
                id,
                userType,
                email,
                name,
                phoneNumber,
                dateOfBirth,
                profileImageURL,
            });
            return res.status(200).json({ token: newToken });
        } else {
            return res.status(400).json({ error: "Tutorial was saved" });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getSavedTutorials = async (req, res) => {
    const { id } = req.user;

    try {
        const user = await User.findById(id).select(["savedTutorials"]).populate("savedTutorials");
        user.savedTutorials.forEach((tutorial, i) => (user.savedTutorials[i] = tutorial.transform()));
        return res.status(200).json(user.savedTutorials);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const searchUser = async (req, res) => {
    const { email, name } = req.query;
    let user;
    let userList;
    let nameRegExp;

    if (!name && !email) return res.status(400).json({ error: "email or name is required" });

    try {
        if (email) {
            user = await User.findOne({ email });
            return res.status(200).json([user.transform()]);
        } else {
            nameRegExp = RegExp(name, "gi");
            userList = await User.find({ name: nameRegExp });
            userList.forEach((u, i) => (userList[i] = u.transform()));

            return res.status(200).json(userList);
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { addTutorial, getSavedTutorials, updateUserInfo, changePassword, searchUser };
