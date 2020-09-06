const { Room } = require("./models/Room");
const { User } = require("./models/User");
const { Message } = require("./models/Message");
const socketIO = require("socket.io");

const runSocket = (server) => {
    const io = socketIO(server);
    io.on("connection", function (socket) {
        socket.on("joinRoom", function (data) {
            socket.join(data.roomId);
        });

        socket.on("room", async function ({ message, userId, roomId }) {
            if (message && roomId) {
                const user = await User.findById(userId);
                const room = await Room.findById(roomId).populate("members");

                if (room && user) {
                    room.members.forEach((mem, i) => (room.members[i] = mem.transform()));
                    const receiver = room.members.find((mem) => mem.id != userId);
                    const newMessage = new Message({
                        room: roomId,
                        sender: userId,
                        text: message,
                    });
                    await newMessage.save();
                    io.to(roomId).emit("messageFromServer", {
                        ...newMessage.transform(),
                        sender: user.transform(),
                        receiver,
                        room: room.transform(),
                    });
                }

                if (room.used) {
                    await Room.updateOne({ _id: roomId }, { lastTimeWorked: new Date() });
                } else {
                    await Room.updateOne({ _id: roomId }, { used: true, lastTimeWorked: new Date() });
                }
            }
        });
    });
};

module.exports = runSocket;
