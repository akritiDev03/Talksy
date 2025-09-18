import User from "../models/User.js";

const updateLastSeen = async (req, res, next) => {
    if (req.user) {
        try {
            await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
        } catch (error) {
            console.error("Error updating last seen:", error);
        }
    }
    next();
};

export default updateLastSeen;