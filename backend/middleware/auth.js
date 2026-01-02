import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token)
        return res.status(401).json({ message: "Unauthenticated" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};