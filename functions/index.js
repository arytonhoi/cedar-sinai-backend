const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const FBAuth = require("./util/fbAuth");
const { admin, db } = require("./util/admin");
const {
  login,
  getAuthenticatedUser,
  updatePassword,
} = require("./handlers/users");
const FieldValue = admin.firestore.FieldValue;

const { postImage } = require("./handlers/images");

const {
  getAllFolders,
  getFolder,
  createFolder,
  deleteFolder,
  updateOneFolder,
  searchFolders,
} = require("./handlers/folders");

const {
  getAllAnnouncements,
  postOneAnnouncement,
  deleteOneAnnouncement,
  updateOneAnnouncement,
} = require("./handlers/announcements");

const {
  getAllDepartments,
  postOneDepartment,
  deleteOneDepartment,
  updateOneDepartment,
} = require("./handlers/departments");

const {
  getAllContacts,
  postOneContact,
  deleteOneContact,
  updateOneContact,
} = require("./handlers/contacts");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.api = functions.https.onRequest(app);

// NEW ROUTES

// user routes
app.post("/login", login);
app.get("/user", FBAuth, getAuthenticatedUser);
app.patch("/user/password", FBAuth, updatePassword);

// image routes
app.post("/images", FBAuth, postImage);

// folder routes
app.get("/folders", FBAuth, getAllFolders);
app.get("/folders/:folderId", FBAuth, getFolder);
app.get("/folders/search/:searchTerm", FBAuth, searchFolders);
app.post("/folders/:folderId", FBAuth, createFolder);
app.delete("/folders/:folderId", FBAuth, deleteFolder);
app.patch("/folders/:folderId", FBAuth, updateOneFolder);

// announcement routes
app.get("/announcements", FBAuth, getAllAnnouncements);
app.post("/announcements", FBAuth, postOneAnnouncement);
app.delete("/announcements/:announcementId", FBAuth, deleteOneAnnouncement);
app.patch("/announcements/:announcementId", FBAuth, updateOneAnnouncement);

// contacts
app.get("/departments", FBAuth, getAllDepartments);
app.post("/departments", FBAuth, postOneDepartment);
app.delete("/departments/:departmentId", FBAuth, deleteOneDepartment);
app.patch("/departments/:departmentId", FBAuth, updateOneDepartment);
app.get("/contacts", FBAuth, getAllContacts);
app.post("/contacts", FBAuth, postOneContact);
app.delete("/contacts/:contactId", FBAuth, deleteOneContact);
app.patch("/contacts/:contactId", FBAuth, updateOneContact);

exports.onDepartmentDelete = functions.firestore
  .document("/departments/{departmentId}")
  .onDelete((snapshot, context) => {
    const departmentId = context.params.departmentId;
    const batch = db.batch();
    return db
      .collection("contacts")
      .where("departmentId", "==", departmentId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/contacts/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });

exports.onFolderDelete = functions.firestore
  .document("/folders/{folderId}")
  .onDelete((snapshot, context) => {
    const folderId = context.params.folderId;
    const batch = db.batch();
    const folderPathsMapRef = db.collection("paths").doc("folders");
    return db
      .collection("folders")
      .where("parent", "==", folderId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          const docId = doc.id;
          batch.update(folderPathsMapRef, { [docId]: FieldValue.delete() });
          batch.delete(db.doc(`/folders/${docId}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
