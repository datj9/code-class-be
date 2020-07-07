const dotenv = require("dotenv");
const path = require("path");
const envPath = path.join(`${__dirname}/../.env`);
dotenv.config({ path: envPath });

let mongoURI;
let secretKey;
const bucket = process.env.BUCKET_NAME;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

switch (process.env.NODE_ENV) {
    case "local":
        mongoURI = process.env.LOCAL_MONGODB_URI;
        secretKey = process.env.LOCAL_SECRET_KEY;
        break;
    case "staging":
        mongoURI = process.env.STAGING_MONGODB_URI;
        secretKey = process.env.STAGING_SECRET_KEY;
        break;
    default:
        break;
}

module.exports = {
    mongoURI,
    secretKey,
    bucket,
    accessKeyId,
    secretAccessKey,
};
