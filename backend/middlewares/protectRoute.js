import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (decoded?.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      res.status(403).json({ error: "Unauthorized user!" });
    }
  } catch (err) {
    console.log(err, "Error in protect route");
    res.status(200).json({ error: "Internal server error" });
  }
};
