const { Test } = require("../../../models/Test");
const { Question } = require("../../../models/Question");
const isInt = require("validator/lib/isInt");
const ObjectId = require("mongoose").Types.ObjectId;

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
    const { title, description, thumbnailUrl, technologies, questions } = req.body;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!technologies) errors.technologies = "technologies is required";
    if (!questions) errors.questions = "questions is required";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "description is invalid";
    if (!isURL(thumbnailUrl + "")) errors.thumbnailUrl = "title is invalid";
    if (!Array.isArray(technologies)) errors.technologies = "technologies is invalid";
    if (!Array.isArray(questions)) errors.questions = "questions is invalid";

    questions.forEach((q) => {
        if (!ObjectId.isValid(q)) return res.status(400).json({ questions: "questions is invalid" });
    });

    try {
        const foundQuestions = await Question.find().where("_id").in(questions);
        if (foundQuestions.length != questions.length)
            return res.status(400).json({ questions: "questions not found" });

        const test = new Test({
            title,
            description,
            thumbnailUrl,
            technologies,
            questions,
        });
        await test.save();
        return res.status(201).json(test.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTests, createTest };
