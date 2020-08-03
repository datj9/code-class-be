const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const app = express();
const cors = require("cors");
const { mongoURI } = require("./config");

app.use(express.json({ extended: true, limit: "50mb" }));
app.use("/api", cors(), require("./routes/api"));
mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false },
    () => console.log("Connected to MongoDB successfully")
);
app.listen(port, () => console.log(`Server is running on port ${port}`));
