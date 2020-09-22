const { Article } = require("../../../models/Article");
const { User } = require("../../../models/User");
const { TrackingUser } = require("../../../models/TrackingUser");
const isURL = require("validator/lib/isURL");
const ObjectId = require("mongoose").Types.ObjectId;
const isInt = require("validator/lib/isInt");
const isIP = require("validator/lib/isIP");

const getArticles = async (req, res) => {
    let articles;
    let total;
    const { pageSize, pageIndex, tags: tagsReq, sortBy, orderBy } = req.query;
    const limit = isInt(pageSize + "") ? parseInt(pageSize) : 8;
    const skip = isInt(pageIndex + "") ? (pageIndex - 1) * limit : 0;
    const sort = ["createdAt", "views", "difficultyLevel"].includes(sortBy) ? sortBy : "createdAt";
    const order = orderBy == 1 || orderBy == -1 ? parseInt(orderBy) : -1;
    let tags;
    try {
        tags = Array.isArray(JSON.parse(tagsReq)) ? JSON.parse(tagsReq) : undefined;
    } catch (error) {}

    try {
        if (tags && tags.length > 0) {
            articles = await Article.find({ tags: { $in: tags } })
                .sort([[sort, order]])
                .skip(skip)
                .limit(limit)
                .select("-content");
            total = await Article.countDocuments({ tags: { $in: tags } });
        } else {
            articles = await Article.find()
                .sort([[sort, order]])
                .skip(skip)
                .limit(limit)
                .select("-content");
            total = await Article.countDocuments();
        }
        articles.forEach((article, i) => (articles[i] = article.transform()));
        return res.status(200).json({ articles, total });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getArticleById = async (req, res) => {
    const { articleId } = req.params;
    const { id } = req.user;
    let user;

    if (!ObjectId.isValid(articleId + "")) return res.status(400).json({ error: "articleId is invalid" });
    try {
        if (id) {
            user = await User.findById(id);
        }
        const article = await Article.findById(articleId);
        const isSaved = user ? user.savedArticles.includes(articleId) : false;

        return res.status(200).json({
            ...article.transform(),
            isSaved,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createArticle = async (req, res) => {
    const { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags } = req.body;
    const regExpTestTags = new RegExp("React|Vue|Angular|JavaScript|TypeScript|NodeJS|Java");
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (!tags) errors.tags = "tags is required";
    if (!difficultyLevel) errors.difficultyLevel = "difficultyLevel is required";
    if (!readingTime) errors.readingTime = "readingTime is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (
        typeof difficultyLevel != "number" ||
        !isInt(difficultyLevel + "") ||
        difficultyLevel > 4 ||
        difficultyLevel < 1
    ) {
        errors.difficultyLevel = "difficultyLevel is invalid";
    }
    if (typeof readingTime != "number" || readingTime < 1) errors.readingTime = "readingTime is invalid";
    if (!Array.isArray(tags)) errors.tags = "tags is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    regExpTestTags.forEach((tag) => {
        if (regExpTestTags.test(tag) == false) return res.status(400).json({ tags: "tags is invalid" });
    });

    const newArticle = new Article({
        title,
        description,
        thumbnailUrl,
        content,
        difficultyLevel,
        readingTime,
        tags,
    });

    try {
        await newArticle.save();
        return res.status(201).json(newArticle.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateArticle = async (req, res) => {
    const { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags } = req.body;
    const { articleId } = req.params;
    const errors = {};

    if (!title) errors.title = "title is required";
    if (!description) errors.description = "description is required";
    if (!thumbnailUrl) errors.thumbnailUrl = "thumbnailUrl is required";
    if (!content) errors.content = "content is required";
    if (!difficultyLevel) errors.difficultyLevel = "difficultyLevel is required";
    if (!readingTime) errors.readingTime = "readingTime is required";
    if (!tags) errors.tags = "tags is required";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (typeof title != "string") errors.title = "title is invalid";
    if (typeof description != "string") errors.description = "title is invalid";
    if (typeof thumbnailUrl != "string" || !isURL(thumbnailUrl)) errors.thumbnailUrl = "thumbnailUrl is invalid";
    if (typeof content != "string") errors.content = "title is invalid";
    if (
        typeof difficultyLevel != "number" ||
        !isInt(difficultyLevel + "") ||
        difficultyLevel > 4 ||
        difficultyLevel < 1
    ) {
        errors.difficultyLevel = "difficultyLevel is invalid";
    }
    if (typeof readingTime != "number" || readingTime < 1) errors.readingTime = "readingTime is invalid";
    if (!Array.isArray(tags)) errors.tags = "tags is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundArticle = await Article.findById(articleId);
        if (!foundArticle) return res.status(404).json({ error: "Article not found" });
        const article = await Article.findOneAndUpdate(
            { _id: articleId },
            { title, description, thumbnailUrl, content, difficultyLevel, readingTime, tags }
        );
        return res.status(200).json(article.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const increaseView = async (req, res) => {
    const { articleId, ip, country, city } = req.body;
    const errors = {};

    if (!ObjectId.isValid(articleId + "")) errors.articleId = "articleId is invalid";
    if (!isIP(ip)) errors.ip = "ip is invalid";
    if (country && typeof country != "string") errors.country = "country is invalid";
    if (city && typeof city != "string") errors.city = "city is invalid";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const foundTracking = await TrackingUser.findOne({ ip, article: articleId }).populate("article");

        if (!foundTracking) {
            const newTracking = new TrackingUser({
                ip,
                article: articleId,
                country,
                city,
            });
            await newTracking.save();
            await Article.updateOne({ _id: articleId }, { $inc: { views: 1 } });

            return res.status(201).json({
                message: "Created successfully",
            });
        } else if ((Date.now() - foundTracking.lastTimeSeen) / 1000 / 60 > foundTracking.article.readingTime / 8) {
            foundTracking.viwes = ++foundTracking.views;
            foundTracking.lastTimeSeen = Date.now();
            await foundTracking.save();
            await Article.updateOne({ _id: articleId }, { $inc: { views: 1 } });

            return res.status(200).json({ message: "Updated successfully" });
        } else {
            foundTracking.lastTimeSeen = Date.now();
            await foundTracking.save();

            return res.status(200).json({ message: "Updated successfully" });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteArticle = async (req, res) => {
    const { articleId } = req.params;
    if (!ObjectId.isValid(articleId)) return res.status(400).json({ error: "articleId is invalid" });

    try {
        const article = await Article.findById(articleId);
        if (!article) return res.status(400).json({ error: "Article not found" });
        await Article.deleteOne({ _id: articleId });
        return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    increaseView,
    deleteArticle,
};
