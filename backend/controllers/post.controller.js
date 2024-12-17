import { z } from "zod";
import Post from "../models/post.model.js";
import { v2 } from "cloudinary";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    if (!text)
      return res.status(400).json({ error: "Text field is required!" });
    const userId = req.userId;

    const newPost = new Post({
      user: userId,
      text,
    });

    if (img) {
      const uploadedResponse = await v2.uploader.upload(img);
      newPost.img = uploadedResponse.secure_url;
    }

    await newPost.save();

    return res.status(201).json({ msg: "Post created successfully!" });
  } catch (err) {
    console.log(err, "Error in create post controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid inputs" });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found!" });
    if (post.user.toString() !== req.userId)
      res
        .status(401)
        .json({ error: "You are not authorized to delete this post!" });
    await Post.findByIdAndDelete(id);
    if (post.img) {
      await v2.uploader.destroy(post.img.split("/").pop().split(".")[0]);
    }
    res.status(200).json({ msg: "Post deleted successfully!" });
  } catch (err) {
    console.log(err, "Error in delete post controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Comment can't be empty!" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid inputs!" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found!" });

    const userId = req.userId;

    // Add the comment to the post
    post.comments.push({ user: userId, text });
    await post.save();

    // Create notification
    try {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "comment",
      });
      await notification.save();
    } catch (err) {
      console.error("Error saving notification:", err);
    }

    // Add post ID to user's commentedPosts
    const user = await User.findById(userId).select("-password");
    if (user) {
      user.commentedPosts.push(post._id);
      await user.save();
    }

    // Populate the post for the response
    await post.populate({ path: "user", select: "-password" });
    await post.populate({ path: "comments.user", select: "-password" });

    return res.status(201).json({
      msg: "Comment successful!",
      comments: post.comments,
    });
  } catch (err) {
    console.error(err, "Error in commentOnPost controller");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeOrUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid inputs!" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found!" });

    const userId = req.userId;
    const user = await User.findById(userId);

    if (post.likes.includes(userId)) {
      post.likes = [...post.likes.filter((item) => item != userId)];
      await post.save();
      user.likedPosts = [
        ...user.likedPosts.filter(
          (item) => item.toString() != post._id.toString()
        ),
      ];
      await user.save();
      res
        .status(200)
        .json({ msg: "Post unliked successfully", updatedLikes: post.likes });
    } else {
      post.likes.push(userId);
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      await post.save();
      user.likedPosts.push(post._id);
      await user.save();
      res
        .status(200)
        .json({ msg: "Post liked successfully", updatedLikes: post.likes });
    }
  } catch (err) {
    console.log(err, "Error in likeOrUnlike controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "likes.user",
        select: "-password",
      });
    if (!posts) return res.status(400).json({ eror: "No posts found" });
    if (posts.length == 0) return res.status(200).json({ posts: [] });
    res.status(200).json({ posts });
  } catch (err) {
    console.log(err, "Error in getSuggestedUsers controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json({ posts: likedPosts });
  } catch (err) {
    console.log(err, "Error in getLikedPosts controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const following = user.following;
    if (following?.length == 0)
      return res.status(200).json({ followingPosts: [] });
    const followingPosts = await Post.find({ _id: { $in: following } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json({ posts: followingPosts });
  } catch (err) {
    console.log(err, "Error in getFollowingPosts controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    // const following = user.following;
    // if (following?.length == 0)
    //   return res.status(200).json({ followingPosts: [] });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json({ posts });
  } catch (err) {
    console.log(err, "Error in getFollowingPosts controller");
    res.status(500).json({ error: "Internal server error!" });
  }
};
