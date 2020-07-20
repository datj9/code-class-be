const { Test } = require("../../../models/Test");
const isInt = require("validator/lib/isInt");

const getTests = async (req, res) => {
    const { pageSize, pageIndex } = req.query;
    const limit = isInt(pageSize + "") ? parseInt(pageSize) : 8;
    const skip = isInt(pageIndex + "") ? (pageIndex - 1) * limit : 0;

    try {
        const tests = await Test.find().skip(skip).limit(limit);

        tests.forEach((test, i) => (tests[i] = test.transform()));
        return res.status(200).json(tests);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createTest = async (req, res) => {
    const { title, description, thumbnailUrl, technology, questions } = req.body;
};

module.exports = { getTests };
