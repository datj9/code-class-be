const { Technology } = require("../../../models/Technology");

const getTechnologies = async (req, res) => {
    try {
        const technologies = await Technology.find();
        technologies.forEach((tech, i) => (technologies[i] = tech.transform()));

        return res.status(200).json(technologies);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTechnologies };
