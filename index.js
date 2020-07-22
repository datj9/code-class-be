const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const app = express();
const cors = require("cors");
const { mongoURI } = require("./config");
const cron = require("cron");
const { Tutorial } = require("./models/Tutorial");

const job = new cron.CronJob({
    cronTime: "0 */30 * * * *",
    onTick: async function () {
        await Tutorial.find().limit(5);
        console.log("get");
    },
    start: true,
    timeZone: "Asia/Ho_Chi_Minh",
});

app.use(express.json({ extended: true, limit: "50mb" }));
app.use("/api", cors(), require("./routes/api"));
mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false },
    () => console.log("Connected to MongoDB successfully")
);
app.listen(port, () => console.log(`Server is running on port ${port}`));
job.start();
