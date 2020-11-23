const { admin, db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

const firebaseConfig = require("../util/config");
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const { validateLoginData } = require("../util/validators");

// log user in
exports.login = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  var user = {
    email: "",
    password: "",
  };
  // turn username into email
  try {
    user = {
      email: req.body.username.toString().concat("@email.com"),
      password: req.body.password.toString(),
    };
  } catch (e) {
    return res.status(400).json({
      error: "Incomplete JSON, username and password fields required.",
    });
  }
  // validate data
  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  // When the user signs in with email and password.
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((userData) => {
      // Get the user's ID token as it is needed to exchange for a session cookie.
      return userData.user.getIdToken().then((idToken) => {
        // expires in 14 days
        const expiresIn = 1000 * 60 * 60 * 24 * 14;
        admin
          .auth()
          .createSessionCookie(idToken, { expiresIn })
          .then((sessionCookie) => {
            // Set cookie policy for session cookie.
            const options = {
              maxAge: expiresIn,
              httpOnly: true,
              secure: false, // set to true for HTTPS, false for HTTP
            };
            res.cookie("session", sessionCookie, options);
            return res.status(200).json({ status: "Login successful" });
          });
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Password incorrect, please try again" });
      } else if (err.code === "auth/user-not-found") {
        return res
          .status(403)
          .json({ general: "Username incorrect, please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

// revoke cookie
exports.logout = (req, res) => {
  let sessionCookie;
  try {
    sessionCookie = req.cookies.session;
  } catch (err) {
    console.error("Authentication cookie not provided");
    return res.status(403).json({ error: "Unauthorized" });
  }
  res.clearCookie("session");
  admin
    .auth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
      return admin.auth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      res.status(200).json({ status: "Logout successful" });
    })
    .catch((err) => {
      console.log(err);
      return res.status(403).json({ status: "Logout failed" });
    });
};

// get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.userId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData = doc.data();
        return res.json(userData);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// change user password
exports.updatePassword = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }

  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ error: "User unauthorized to change account password" });
  }

  // turn username into email
  const user = {
    email: req.body.username.concat("@email.com"),
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword,
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.oldPassword)
    .then((resUser) => {
      console.log(`${user.email}, ${user.oldPassword}, ${user.newPassword}`);
      firebase
        .auth()
        .currentUser.updatePassword(user.newPassword)
        .then(function () {
          return res.json({ message: "Password updated successfully " });
        })
        .catch(function (err) {
          console.error(err);
          return res.status(500).json({ error: err });
        });
    })
    .catch(function (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

// log user in
// exports.login = (req, res) => {
//   try {
//     req = fixFormat(req);
//   } catch (e) {
//     return res.status(400).json({ error: "Invalid JSON." });
//   }
//   var user = {
//     email: "",
//     password: "",
//   };
//   // turn username into email
//   try {
//     user = {
//       email: req.body.username.toString().concat("@email.com"),
//       password: req.body.password.toString(),
//     };
//   } catch (e) {
//     return res.status(400).json({
//       error: "Incomplete JSON, username and password fields required.",
//     });
//   }
//   // validate data
//   const { valid, errors } = validateLoginData(user);
//   if (!valid) return res.status(400).json(errors);

//   firebase
//     .auth()
//     .signInWithEmailAndPassword(user.email, user.password)
//     .then((data) => {
//       return data.user.getIdToken();
//     })
//     .then((token) => {
//       return res.json({ token });
//     })
//     .catch((err) => {
//       console.error(err);
//       if (err.code === "auth/wrong-password") {
//         return res
//           .status(403)
//           .json({ general: "Wrong password, please try again" });
//       } else if (err.code === "auth/user-not-found") {
//         return res
//           .status(403)
//           .json({ general: "Wrong username, please try again" });
//       } else {
//         return res.status(500).json({ error: err.code });
//       }
//     });
// };
