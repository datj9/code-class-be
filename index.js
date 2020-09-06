const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { mongoURI } = require("./config");
const runSocket = require("./helpers/socket");

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
// const whitelist = ["https://codeclass.vercel.app", "https://codeclassadmin.vercel.app"];
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
// };
runSocket(server);

app.use(express.json({ extended: true, limit: "10mb" }));
app.use("/api", cors(), require("./routes/api"));
mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false },
    () => console.log("Connected to MongoDB successfully")
);

server.listen(port, () => console.log(`Server is running on port ${port}`));
