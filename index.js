const express = require("express");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");
const { mongoURI } = require("./config");
const { Room } = require("./models/Room");
const { User } = require("./models/User");
const { Message } = require("./models/Message");
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

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

app.use(express.json({ extended: true, limit: "50mb" }));
app.use("/api", cors(), require("./routes/api"));
mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false },
    () => console.log("Connected to MongoDB successfully")
);

io.on("connection", function (socket) {
    socket.on("joinRoom", function (data) {
        socket.join(data.roomId);
    });

    socket.on("room", async function (data) {
        if (data.message && data.roomId) {
            const newMessage = new Message({
                room: data.roomId,
                sender: data.userId,
                text: data.message,
            });
            await newMessage.save();
            io.to(data.roomId).emit("messageFromServer", newMessage.transform());
        }
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
