const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

const createToken = async (payload) => {
    try {
        const token = await jwt.sign(payload, secretKey, { expiresIn: "4h" });
        return token;
    } catch (error) {
        return res.status(500).json({ error });
    }
};

module.exports = createToken;
