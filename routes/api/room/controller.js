const ObjectId = require("mongoose").Types.ObjectId;
const { Room } = require("../../../models/Room");
const { User } = require("../../../models/User");

const getRooms = async (req, res) => {
    const { id } = req.user;

    try {
        const rooms = await Room.find({ members: { $in: [id] } });
        rooms.forEach((r, i) => (rooms[i] = r.transform()));
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
        const room = await Room.findById(roomId).populate(["members"]);
        if (room && room.members.findIndex(userId) >= 0) {
            return res.status(200).json(room.transform());
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
        const numberOfMembers = await User.countDocuments({ _id: { $in: members } });
        if (numberOfMembers != members.length) errors.members = "members not found";
        if (name && typeof name != "string") errors.name = "name is invalid";

        const newRoom = new Room({
            members,
            name,
        });
        await newRoom.save();
        return res.status(201).json(newRoom.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getRooms, getRoomById, createRooms };
