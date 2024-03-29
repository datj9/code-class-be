const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { bucket, accessKeyId, secretAccessKey } = require("../config");

const s3 = new aws.S3({
    accessKeyId,
    secretAccessKey,
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: "public-read",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.originalname });
        },
        key: function (req, file, cb) {
            const fileAfterSplited = file.originalname.split(".");
            const fileType = fileAfterSplited[fileAfterSplited.length - 1];
            cb(null, `images/${uuidv4()}.${fileType}`);
        },
    }),
    limits: {
        fileSize: 5 * Math.pow(1024, 2),
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
            return callback(new Error("Only images are allowed"));
        }
        return callback(null, true);
    },
});

const uploadSingle = (type, req, res) => {
    return upload.single(type)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            [("name", "storageErrors")].forEach((e) => delete err[e]);
            return res.status(400).json({ error: err });
        } else if (err) {
            console.log(err);
            return res.status(400).json({ error: err });
        } else {
            return res.status(200).json({ linkUrl: req.file.location });
        }
    });
};

const uploadSingleImage = (req, res) => {
    uploadSingle("image", req, res);
};

module.exports = {
    uploadSingleImage,
};
