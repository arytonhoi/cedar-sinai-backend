const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

// app.use(cors());
// const { createProxyMiddleware } = require("http-proxy-middleware");
// app.use(
//     "/api",
//     createProxyMiddleware({
//         target: "http://localhost:8080/", //original url
//         changeOrigin: true,
//         //secure: false,
//         onProxyRes: function (proxyRes, req, res) {
//             proxyRes.headers["Access-Control-Allow-Origin"] = "*";
//         },
//     })
// );
// app.listen(5000);

const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

const {
    login,
} = require("./handlers/users");

const {
    getAllFiles,
    getFile,
    createFile,
    deleteFile,
} = require("./handlers/files");

const {
    getAllAnnouncements,
    postOneAnnouncement,
    deleteOneAnnouncement,
    // updateOneAnnouncement,
} = require("./handlers/announcements");

const {
    getAllDepartments,
    postOneDepartment,
    deleteOneDepartment,
    // updateOneDepartment,
} = require("./handlers/departments");

const {
    getAllContacts,
    postOneContact,
    deleteOneContact,
    // updateOneContact,
} = require("./handlers/contacts");

// const {
//     getAllSchedules,
//     postOneSchedule,
//     deleteOneSchedule,
// } = require("./handlers/schedules");


// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.api = functions.https.onRequest(app);

// NEW ROUTES
// Swagger UI route

// user routes
app.post("/login", login);

// file routes
app.get("/files", FBAuth, getAllFiles);
app.get("/files/:fileId", FBAuth, getFile);
app.post("/files/:fileId", FBAuth, createFile);
app.delete("/files/:fileId", FBAuth, deleteFile);
// app.patch("/files/:fileId", FBAuth, modifyFileContents);

// announcement routes
app.get("/announcements", FBAuth, getAllAnnouncements);
app.post("/announcements", FBAuth, postOneAnnouncement);
app.delete("/announcements/:announcementId", FBAuth, deleteOneAnnouncement);
// app.patch("/announcements/:announcementId", FBAuth, updateOneAnnouncement);

// contacts
app.get("/departments", FBAuth, getAllDepartments);
app.post("/departments", FBAuth, postOneDepartment);
app.delete("/departments/:departmentId", FBAuth, deleteOneDepartment);
// app.patch("/departments/:departmentId", FBAuth, updateOneDepartment);
app.get("/contacts", FBAuth, getAllContacts);
app.post("/contacts", FBAuth, postOneContact);
app.delete("/contacts/:contactId", FBAuth, deleteOneContact);
// app.patch("/contacts/:contactId", FBAuth, updateOneContact);

// schedule routes
// app.get("/schedules", FBAuth, getAllSchedules);
// app.post("/schedules", FBAuth, postOneSchedule);
// app.delete("/schedules/:scheduleId", FBAuth, deleteOneSchedule);
// app.patch("/announcements/:announcementId", FBAuth, updateOneAnnouncement);

// 
// =============================================================================
// OLD CODE
// =============================================================================

// OLD ROUTES
// Scream routes
// app.get("/screams", FBAuth, getAllScreams);
// app.post("/scream", FBAuth, postOneScream);
// app.get("/scream/:screamId", getScream);
// app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
// app.get("/scream/:screamId/like", FBAuth, likeScream);
// app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
// app.delete("/scream/:screamId", FBAuth, deleteScream);

// user routes
// app.post("/signup", signup);
// app.post("/login", login);
// app.post("/user/image", FBAuth, uploadImage);
// app.post("/user", FBAuth, addUserDetails);
// app.get("/user", FBAuth, getAuthenticatedUser);
// app.get("/user/:handle", getUserDetails);
// app.post("/notifications", FBAuth, markNotificationsRead);

// exports.createNotificationOnLike = functions
//     .region("us-central1")
//     .firestore.document("likes/{id}")
//     .onCreate((snapshot) => {
//         return db
//             .doc(`/screams/${snapshot.data().screamId}`)
//             .get()
//             .then((doc) => {
//                 if (
//                     doc.exists &&
//                     doc.data().userHandle !== snapshot.data().userHandle
//                 ) {
//                     return db.doc(`/notifications/${snapshot.id}`).set({
//                         createdAt: new Date().toISOString(),
//                         recipient: doc.data().userHandle,
//                         sender: snapshot.data().userHandle,
//                         type: "like",
//                         read: false,
//                         screamId: doc.id,
//                     });
//                 }
//             })
//             .catch((err) => console.error(err));
//     });

// exports.deleteNotificationOnLike = functions
//     .region("us-central1")
//     .firestore.document("likes/{id}")
//     .onDelete((snapshot) => {
//         return db
//             .doc(`/notifications/${snapshot.id}`)
//             .delete()
//             .catch((err) => {
//                 console.error(err);
//                 return;
//             });
//     });

// exports.createNotificationOnComment = functions
//     .region("us-central1")
//     .firestore.document("comments/{id}")
//     .onCreate((snapshot) => {
//         return db
//             .doc(`/screams/${snapshot.data().screamId}`)
//             .get()
//             .then((doc) => {
//                 if (
//                     doc.exists &&
//                     doc.data().userHandle !== snapshot.data().userHandle
//                 ) {
//                     return db.doc(`/notifications/${snapshot.id}`).set({
//                         createdAt: new Date().toISOString(),
//                         recipient: doc.data().userHandle,
//                         sender: snapshot.data().userHandle,
//                         type: "comment",
//                         read: false,
//                         screamId: doc.id,
//                     });
//                 }
//             })
//             .catch((err) => {
//                 console.error(err);
//                 return;
//             });
//     });

// exports.onUserImageChange = functions
//     .region("us-central1")
//     .firestore.document("/users/{userId}")
//     .onUpdate((change) => {
//         console.log(change.before.data());
//         console.log(change.after.data());
//         if (change.before.data().imageUrl !== change.after.data().imageUrl) {
//             console.log("image has changed");
//             const batch = db.batch();
//             return db
//                 .collection("screams")
//                 .where("userHandle", "==", change.before.data().handle)
//                 .get()
//                 .then((data) => {
//                     data.forEach((doc) => {
//                         const scream = db.doc(`/screams/${doc.id}`);
//                         batch.update(scream, {
//                             userImage: change.after.data().imageUrl,
//                         });
//                     });
//                     return batch.commit();
//                 });
//         } else return true;
//     });

// exports.onScreamDelete = functions
//     .region("us-central1")
//     .firestore.document("/screams/{screamId}")
//     .onDelete((snapshot, context) => {
//         const screamId = context.params.screamId;
//         const batch = db.batch();
//         return db
//             .collection("comments")
//             .where("screamId", "==", screamId)
//             .get()
//             .then((data) => {
//                 data.forEach((doc) => {
//                     batch.delete(db.doc(`/comments/${doc.id}`));
//                 });
//                 return db
//                     .collection("likes")
//                     .where("screamId", "==", screamId)
//                     .get();
//             })
//             .then((data) => {
//                 data.forEach((doc) => {
//                     batch.delete(db.doc(`/likes/${doc.id}`));
//                 });
//                 return db
//                     .collection("notifications")
//                     .where("screamId", "==", screamId)
//                     .get();
//             })
//             .then((data) => {
//                 data.forEach((doc) => {
//                     batch.delete(db.doc(`/notifications/${doc.id}`));
//                 });
//                 return batch.commit();
//             })
//             .catch((err) => console.error(err));
//     });
