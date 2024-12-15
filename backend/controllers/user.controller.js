import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v2 } from "cloudinary";

const updateUserBodySchema = z
  .object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    username: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .regex(
        /[A-Z]/,
        "New password must contain at least one uppercase letter."
      )
      .regex(
        /[a-z]/,
        "New password must contain at least one lowercase letter."
      )
      .regex(/[0-9]/, "New password must contain at least one number.")
      .regex(
        /[@$!%*?&#]/,
        "New password must contain at least one special character."
      )
      .optional(),
    bio: z.string().optional(),
    link: z.string().url().optional(),
    profileImg: z.string().url().optional(),
    coverImg: z.string().url().optional(),
  })
  .refine((data) => !data.currentPassword || data.newPassword, {
    message: "Please provide both current password and new password!",
    path: ["newPassword"], // This specifies the error path in the validation error.
  });

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Invalid inputs!" });
    }
    const user = await User.findOne({ username }).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ error: "User not found!" });
    }
  } catch (err) {
    console.log(err, "Error in getuserprofile controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const followOrUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (id == userId)
      return res
        .status(400)
        .json({ error: "You can't follow or unfollow yourself!" });
    if (user.followers.includes(id)) {
      await User.updateOne({ _id: id }, { $pull: { followers: id } });
      await User.updateOne({ _id: userId }, { $pull: { following: id } });
      const notification = new Notification({
        from: userId,
        to: id,
        type: "follow",
      });
      await notification.save();
      res.status(200).json({ msg: "User followed successfully" });
    } else {
      await User.updateOne({ _id: id }, { $push: { followers: id } });
      await User.updateOne({ _id: userId }, { $push: { following: id } });
      res.status(200).json({ msg: "User unfollowed successfully" });
    }
  } catch (err) {
    console.log(err, "Error in followOrUnfollowUser controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const followedUsers = await User.findById(userId).select("following");
    const users = await User.find({
      _id: { $ne: userId, $nin: followedUsers.following }, // Exclude the current user and followed users
    }).limit(4);
    res.status(200).json({ users });
  } catch (err) {
    console.log(err, "Error in getSuggestedUsers controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const isValid = updateUserBodySchema.safeParse(req.body);
    if (!isValid?.success)
      return res.status(400).json({ error: isValid.error.errors[0]?.message });
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    const { profileImg, coverImg } = req.body;
    const userId = req.userId;
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.json(400).json({ error: "Current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await v2.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await v2.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await v2.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await v2.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    delete user.password;

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err, "Error in updateUser controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};
