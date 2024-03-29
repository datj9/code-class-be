const ObjectId = require("mongoose").Types.ObjectId;
const { Room } = require("../../../models/Room");
const { User } = require("../../../models/User");
const { Message } = require("../../../models/Message");

const getRooms = async (req, res) => {
    const { id: userId } = req.user;

    try {
        const rooms = await Room.find({ members: userId, used: true })
            .sort([["lastTimeWorked", -1]])
            .populate("members");
        const messages = [];

        rooms.forEach((room) => {
            messages.push(Message.findOne({ room: room._id }).sort([["createdAt", -1]]));
        });
        const foundMessages = await Promise.all(messages);

        rooms.forEach((r, i) => {
            rooms[i].members.forEach((member, j) => (rooms[i].members[j] = member.transform()));
            rooms[i] = r.transform();
            rooms[i].lastestMessage = foundMessages[i].transform();
            rooms[i].receiver = r.members.find((mem) => mem.id != userId);
        });

        return res.status(200).json(rooms);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getRoomById = async (req, res) => {
    const { roomId } = req.params;
    const { id: userId } = req.user;

    if (!ObjectId.isValid(roomId + "")) return res.status(400).json({ roomId: "members is invalid" });

    try {
        const room = await Room.findOne({ _id: roomId, members: { $in: [userId] } }).populate("members");

        if (room) {
            const messages = await Message.find({ room: room._id }).populate("sender");

            messages.forEach((msg, i) => {
                messages[i] = msg.transform();
                messages[i].sender = msg.sender.transform();
            });

            room.members.forEach((mem, i) => {
                const transformedMem = mem.transform();
                room.members[i] = transformedMem;
            });

            return res.status(200).json({ room: room.transform(), messages });
        } else {
            return res.status(400).json({ roomId: "room not found" });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createRooms = async (req, res) => {
    const { name, members } = req.body;
    const errors = {};

    if (!members) return res.status(400).json({ members: "members is required" });
    if (!Array.isArray(members)) return res.status(400).json({ members: "members is invalid" });
    members.forEach((mem) => {
        if (!ObjectId.isValid(mem + "")) return res.status(400).json({ members: "members is invalid" });
    });

    try {
        const foundMembers = await User.find({ _id: { $in: members } }).select(["_id", "userType", "email", "name"]);

        if (foundMembers.length != members.length) errors.members = "members not found";
        if (name && typeof name != "string") errors.name = "name is invalid";

        const newRoom = new Room({
            members: foundMembers,
            name,
        });
        await newRoom.save();
        foundMembers.forEach((mem, i) => (foundMembers[i] = mem.transform()));
        return res
            .status(201)
            .json({ ...newRoom.transform(), members: foundMembers, numberOfMembers: foundMembers.length });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const connectMentor = async (req, res) => {
    const { members } = req.body;

    if (!members) return res.status(400).json({ members: "members is required" });
    if (!Array.isArray(members)) return res.status(400).json({ members: "members is invalid" });
    members.forEach((mem) => {
        if (!ObjectId.isValid(mem + "")) return res.status(400).json({ members: "members is invalid" });
    });

    try {
        const foundRoom = await Room.findOne({ members: { $all: members } });

        if (!foundRoom) {
            const foundMembers = await User.find({ _id: { $in: members } });
            if (foundMembers.length != members.length) {
                return res.status(400).json({ members: "members not found" });
            }

            const newRoom = new Room({
                members,
            });
            await newRoom.save();
            return res.status(201).json({ room: newRoom.transform(), messages: [] });
        } else {
            const messages = await Message.find({ room: foundRoom._id }).populate("sender");

            messages.forEach((msg, i) => {
                messages[i] = msg.transform();
                messages[i].sender = msg.sender.transform();
            });

            return res.status(200).json({ room: foundRoom.transform(), messages });
        }
    } catch (error) {}
};

module.exports = { getRooms, getRoomById, createRooms, connectMentor };
