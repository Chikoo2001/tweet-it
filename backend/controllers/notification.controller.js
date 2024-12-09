import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNoticiations = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found!" });
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "-password",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json({ notifications });
  } catch (err) {
    console.log(err, "Error in getNoticiations controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const deleteNoticiations = async (req, res) => {
  try {
    const userId = req.userId;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully!" });
  } catch (err) {
    console.log(err, "Error in deleteNoticiations controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const deleteNoticiation = async (req, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.userId;
      const notification = await Notification.findById(notificationId);
      if(!notification) return res.status(404).json({error: "Notificaiton not found"});
      if(notification.to.toString() !== userId) return res.status(404).json({error: 'You are not allowed to delete this notification!'});
      await Notification.findByIdAndDelete(id);
      res.status(200).json({ message: "Notification deleted successfully!" });
    } catch (err) {
      console.log(err, "Error in deleteNoticiation controller");
      res.status(500).json({ error: "Internal server error!" });
    }
  };
