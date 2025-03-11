const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided.", success: false });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: "Invalid token. Please log in again.", success: false });
      }
      req.user = decoded;
      next();
  });
};
