const Word = require("../../../models/Word");
const isInt = require("validator/lib/isInt");
const isURL = require("validator/lib/isURL");
const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");

const axiosInstance = axios.create({
    baseURL: "https://wordsapiv1.p.rapidapi.com",
    headers: {
        "content-type": "application/octet-stream",
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "db0d3fc08amshc4197240e38cd89p1931f5jsnf44535148a7f",
        useQueryString: true,
    },
});

const getWords = async (req, res) => {
    const { id } = req.user;
    const { pageSize, pageIndex } = req.query;
    const limit = isInt(pageSize + "") ? parseInt(pageSize) : 10;
    const skip = isInt(pageIndex + "") ? parseInt(pageIndex) * limit : 0;

    try {
        const foundWords = await Word.find().where("user").eq(id).skip(skip).limit(limit);
        foundWords.forEach((word, i) => (foundWords[i] = word.transform()));
        return res.status(200).json(foundWords);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getWordById = async (req, res) => {
    const { wordId } = req.params;
    const { id: userId } = req.user;

    if (!ObjectId.isValid(wordId)) return res.status(400).json({ error: "wordId is invalid" });

    try {
        const foundWord = await Word.findById(wordId);
        if (!foundWord || foundWord.user != userId) {
            return res.status(404).json({ error: "Word not found" });
        }
        return res.status(200).json(foundWord.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const searchWord = async (req, res) => {
    const { word } = req.params;

    try {
        const necessaryDataFromWordsAPI = ["definitions", "synonyms", "antonyms", "examples"];
        const pronunciationRes = await axiosInstance.get(`/words/${word}/pronunciation`);
        const allResFromWordsAPI = await Promise.all(
            necessaryDataFromWordsAPI.map((endpoint) => axiosInstance.get(`/words/${word}/${endpoint}`))
        );

        return res.status(200).json({
            pronunciation: pronunciationRes.data.all,
            definitions: allResFromWordsAPI[0].data.definitions,
            synonyms: allResFromWordsAPI[1].data.synonyms,
            antonyms: allResFromWordsAPI[2].data.antonyms,
            examples: allResFromWordsAPI[3].data.examples,
        });
    } catch (error) {
        if (error.response && error.response.data.message && error.response.data.message.includes("not found")) {
            return res.status(404).json({ error: "Word not found" });
        }
        return res.status(500).json(error);
    }
};

const createWord = async (req, res) => {
    const { text, pronunciation, definitions, synonyms, antonyms, examples, attachmentImage } = req.body;
    const { id } = req.user;
    const validatedFields = ["text", "pronunciation", "definitions"];
    const errors = {};

    validatedFields.forEach((field) => {
        if (!req.body[field]) errors[field] = `${field} is required`;
    });
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof text != "string") errors.text = "text is invalid";
    if (typeof pronunciation != "string") errors.pronunciation = "pronunciation is invalid";
    if (!Array.isArray(definitions)) errors.definitions = "definitions is invalid";
    if (!Array.isArray(synonyms)) errors.synonyms = "synonyms is invalid";
    if (!Array.isArray(annonyms)) errors.annonyms = "annonyms is invalid";
    if (!Array.isArray(examples)) errors.examples = "examples is invalid";
    if (attachmentImage && !isURL(attachmentImage)) errors.attachmentImage = "attachmentImage is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const newWord = new Word({
            text,
            user: id,
            pronunciation,
            definitions,
            synonyms,
            antonyms,
            examples,
        });

        await newWord.save();

        return res.status(201).json(newWord.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateWordStatus = async (req, res) => {
    const { isRemebered } = req.body;
    const { id: userId } = req.user;
    const { wordId } = req.params;
    const errors = {};

    if (typeof isRemebered != "boolean") errors.isRemebered = "isRemebered is invalid";
    if (!ObjectId.isValid(wordId)) errors.wordId = "wordId is invalid";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundWord = await Word.findById(wordId);
        if (!foundWord || foundWord.user != userId) {
            return res.status(404).json({ error: "Word not found" });
        }
        await Word.updateOne({ _id: wordId }, { isRemebered });
        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteWord = async (req, res) => {
    const { id: userId } = req.user;
    const { wordId } = req.params;

    if (!ObjectId.isValid(wordId)) errors.wordId = "wordId is invalid";

    try {
        const foundWord = await Word.findById(wordId);
        if (!foundWord || foundWord.user != userId) {
            return res.status(404).json({ error: "Word not found" });
        }
        await Word.deleteOne({ _id: wordId });
        return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getWords, getWordById, searchWord, createWord, updateWordStatus, deleteWord };
