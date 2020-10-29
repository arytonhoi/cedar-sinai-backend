const { admin, db } = require("./admin");

module.exports = FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      if (data.docs.length < 1) {
        console.error("User doesn't exist in database");
        return res.status(403).json({ error: "User doesn't exist" });
      }
      req.user.userId = data.docs[0].id;
      req.user.email = data.docs[0].data().email;
      req.user.isAdmin = data.docs[0].data().isAdmin;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token ", err);
      return res.status(403).json(err);
    });
};
