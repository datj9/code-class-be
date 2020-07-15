const { TrackingUser } = require("../../../models/TrackingUser");

const getTrackings = async (req, res) => {
    try {
        const trackings = await TrackingUser.find().populate("tutorial");
        trackings.forEach(
            (tracking, i) => (trackings[i] = { ...tracking.transform(), tutorial: tracking.tutorial.transform() })
        );
        return res.status(200).json(trackings);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getTrackings };
