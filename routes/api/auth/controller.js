const bcrypt = require("bcryptjs");
const validator = require("validator");
const { User } = require("../../../models/User");
const { promisify } = require("util");
const hashPass = promisify(bcrypt.hash);
const dayjs = require("dayjs");
const createToken = require("../../../utils/createToken");
const { Mentor } = require("../../../models/Mentor");

const signUp = async (req, res) => {
    const validatedFields = ["email", "password", "confirmPassword", "name"];
    const reqBody = req.body;
    const { email, name, password, confirmPassword, phoneNumber, dateOfBirth } = reqBody;
    const errors = {};
    let shortName;

    for (let field of validatedFields) {
        if (!reqBody[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (password.length < 8) errors.password = "password is too weak";
    if (password !== confirmPassword) errors.confirmPassword = "password and confirmPassword does not match";
    if (!validator.isEmail(email)) errors.email = "email is not valid";
    if (phoneNumber && !validator.isMobilePhone(phoneNumber + "", "vi-VN")) {
        errors.phoneNumber = "phoneNumber is invalid";
    }
    if (dateOfBirth && !validator.isDate(dayjs(dateOfBirth).format("YYYY/MM/DD"))) {
        errors.dateOfBirth = "dateOfBirth is invalid";
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const user = await User.findOne({ email });
        if (user) {
            errors.email = "email already exists";
            return res.status(400).json(errors);
        }
        const hash = await hashPass(password, 10);
        shortName = name.trim().split(" ")[0][0] + name.trim().split(" ")[name.trim().split(" ").length - 1][0];

        const newUser = new User({
            email,
            name,
            shortName,
            password: hash,
            phoneNumber,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        });
        await newUser.save();
        const { id, userType } = newUser;
        const token = await createToken({ id, email, name, userType, phoneNumber, dateOfBirth });
        return res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const signIn = async (req, res) => {
    const validatedFields = ["email", "password"];
    const errors = {};
    const { email, password } = req.body;
    let shortName;

    for (let field of validatedFields) {
        if (!req.body[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ email: "Email does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(403).json({ password: "Password does not match" });

        shortName =
            user.name.trim().split(" ")[0][0] + user.name.trim().split(" ")[user.name.trim().split(" ").length - 1][0];
        user = user.transform();
        if (!user.shortName) {
            await User.updateOne({ email }, { shortName });
        }
        if (user.userType != "mentor") {
            const { id, name, userType, phoneNumber, dateOfBirth, profileImageURL } = user;
            const token = await createToken({
                id,
                email,
                name,
                userType,
                phoneNumber,
                dateOfBirth,
                profileImageURL,
                shortName,
            });
            return res.status(200).json({
                token,
            });
        } else {
            let mentor = await Mentor.findOne({ user: user.id });
            mentor = mentor.transform();
            mentor.mentorId = mentor.id;

            const { id, name, userType, phoneNumber, dateOfBirth, profileImageURL } = user;
            const token = await createToken({
                ...mentor,
                id,
                email,
                name,
                userType,
                phoneNumber,
                dateOfBirth,
                profileImageURL,
                shortName,
            });
            return res.status(200).json({
                token,
            });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { signIn, signUp };
