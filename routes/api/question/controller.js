const { Question } = require("../../../models/Question");

const createQuestion = async () => {
    const { text, answers, correctAnswer, explaination } = req.body;
    const errors = {};

    if (!text) errors.text = "text is required";
    if (!answers) errors.answers = "answers is required";
    if (!correctAnswer) errors.correctAnswer = "correctAnswer is required";
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (typeof text != "string") errors.text = "text is invalid";
    if (typeof correctAnswer != "number") errors.correctAnswer = "correctAnswer is invalid";
    if (explaination && typeof explaination != "string") errors.explaination = "explaination is invalid";
    answers.forEach((answer, i) => {
        if (typeof answer != "string" && errors.answers == undefined) {
            errors.answers = [];
            errors.answers[i] = "answer is invalid";
        } else if (typeof answer != "string") {
            errors.answers[i] = "answer is invalid";
        }
    });
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const question = new Question({
            text,
            answers,
            correctAnswer,
            explaination: explaination ? explaination : undefined,
        });
        await question.save();
        return res.status(201).json(question.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { createQuestion };
