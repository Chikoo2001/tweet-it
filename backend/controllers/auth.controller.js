import { z } from "zod";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

const signUpBody = z.object({
  username: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const loginBody = z.object({
  username: z.string(),
  password: z.string(),
});

export const signup = async (req, res) => {
  try {
    const { success } = signUpBody.safeParse(req.body);
    if (!success) return res.status(400).json({ error: "Invalid inputs" });

    const { fullName, username, email, password } = req.body;

    const isExistingUser = await User.findOne({ username });
    if (isExistingUser)
      return res.status(400).json({ error: "Username is already taken!" });
    const isExistingEmail = await User.findOne({ email });
    if (isExistingEmail)
      return res.status(400).json({ error: "Email is already taken!" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateTokenAndSetCookie(user._id, res);
      // await user.save()
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
    } else {
      return res.status(400).json({ error: "Invalid inputs" });
    }
  } catch (err) {
    console.log(err, "Error in signup controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { success } = loginBody.safeParse(req.body);
    if (!success) return res.status(400).json({ error: "Invalid inputs" });
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user?.password || ""
      );
      if (!isPasswordCorrect)
        return res.status(403).json({ error: "Invalid password" });
      generateTokenAndSetCookie(user._id, res);
      // await user.save()
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.log(err, "Error in signin controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", {}, { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err, "Error in logout controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
    } else {
      res.status(403).json({ error: "User not found!" });
    }
  } catch (err) {
    console.log(err, "Error in getme controller");
    res.status(500).json({ error: "Internal server error" });
  }
};
