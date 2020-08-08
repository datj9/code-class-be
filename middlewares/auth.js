const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

authenticate = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) return res.status(500).json({ error: "Token is required" });
    try {
        const decoded = await jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error });
    }
};

authorize = (allowedUserTypes) => (req, res, next) => {
    const { userType } = req.user;
    const foundIndex = allowedUserTypes.findIndex((type) => type == userType);
    if (foundIndex == -1) return res.status(403).json({ error: "User are not allowed" });
    next();
};

checkToken = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) return res.status(500).json({ error: "Token is required" });

    try {
        const decoded = await jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        req.user = {};
        next();
    }
};

module.exports = { authenticate, authorize, checkToken };
