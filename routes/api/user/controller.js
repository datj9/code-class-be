const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isEmpty = require("validator/lib/isEmpty");
const isEmail = require("validator/lib/isEmail");
const { User } = require("../../../models/User");
const { promisify } = require("util");
const { secretKey } = require("../../../config");
const { Tutorial } = require("../../../models/Tutorial");
const ObjectId = require("mongoose").Types.ObjectId;

const hashPass = promisify(bcrypt.hash);

const createToken = async (payload) => {
    try {
        const token = await jwt.sign(payload, secretKey, { expiresIn: "3h" });
        return token;
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const signUp = async (req, res) => {
    try {
        const validatedFields = ["email", "password", "confirmPassword", "name"];
        let errors = {};
        const reqBody = req.body;
        const { email, name, password, confirmPassword } = reqBody;

        for (let field of validatedFields) {
            if (!reqBody[field]) errors[field] = `${field} is required`;
        }
        if (Object.keys(errors).length) return res.status(500).json(errors);

        if (password.length < 8) errors.password = "password is too weak";
        if (password !== confirmPassword) errors.confirmPassword = "password and confirmPassword does not match";
        if (!isEmail(email)) errors.email = "email is not valid";
        if (Object.keys(errors).length) return res.status(500).json(errors);

        const user = await User.findOne({ email });
        if (user) {
            errors.email = "email already exists";
            return res.status(400).json(errors);
        }
        const hash = await hashPass(password, 10);

        const newUser = new User({
            email,
            name,
            password: hash,
        });
        await newUser.save();
        const { id, userType, savedTutorials } = newUser;
        const token = await createToken({ id, email, name, userType, savedTutorials });
        return res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error });
    }
};

const signIn = async (req, res) => {
    const validatedFields = ["email", "password"];
    const errors = {};
    const { email, password } = req.body;
    for (let field of validatedFields) {
        if (isEmpty(req.body[field])) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(500).json(errors);

    let user = await User.findOne({ email });
    if (!user) return res.status(500).json({ email: "Email does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ password: "Password does not match" });

    user = user.transform();
    delete user.password;

    const token = await createToken(user);
    return res.status(200).json({
        token,
    });
};

const addTutorial = async (req, res) => {
    const { tutorialId } = req.query;
    const { id } = req.user;

    if (!ObjectId.isValid(tutorialId)) return res.status(400).json({ error: "tutorialId is invalid" });

    try {
        const foundTutorial = await Tutorial.findById(tutorialId);
        if (!foundTutorial) return res.status(404).json({ error: "Tutorial not found" });

        const user = await User.findById(id).select("-password");
        const foundIndex = user.savedTutorials.findIndex((tutorial) => tutorial == tutorialId);
        if (foundIndex == -1) {
            user.savedTutorials.push(tutorialId);
            await user.save();
            const newToken = await createToken(user.transform());
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

module.exports = { signIn, signUp, addTutorial, getSavedTutorials };
