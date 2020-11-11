const { admin, db } = require("../util/admin");
const { fixFormat } = require("../util/shim");
const FieldValue = admin.firestore.FieldValue;

// util functions
function getFolderPath(folderPathsMap, folderId) {
  folderPath = [];
  let currentFolderId = folderId;
  while (currentFolderId !== "") {
    let folderPathsMapContent = folderPathsMap[currentFolderId];
    folderPathsMapContent.id = currentFolderId;
    folderPath.push(folderPathsMapContent);
    currentFolderId = folderPathsMapContent.parentId;
  }
  folderPath.reverse();
  return folderPath;
}

// get all folders in database
exports.getAllFolders = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  db.collection("folders")
    .orderBy("lastModified", "desc")
    .get()
    .then((data) => {
      let folders = [];
      data.forEach((doc) => {
        let folder = doc.data();
        folder.id = doc.id;
        folders.push(folder);
      });
      return res.json(folders);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// get single folder
exports.getFolder = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  let folderData = {};
  db.doc(`/folders/${req.params.folderId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Folder not found" });
      }
      folderData = doc.data();
      folderData.id = doc.id;
      // get all folder contents
      return db
        .collection("folders")
        .orderBy("lastModified", "desc")
        .where("parent", "==", folderData.id)
        .get();
    })
    .then((folderContents) => {
      // add folder contents to folder object
      folderData.subfolders = [];
      folderContents.forEach((content) => {
        let subfolder = content.data();
        subfolder.id = content.id;
        folderData.subfolders.push(subfolder);
      });
      return db.doc("/paths/folders").get();
    })
    .then((doc) => {
      // recursively construct folder path map
      if (!doc.exists) {
        return res.status(500).json({ error: "Folder not found" });
      }
      const folderPathsMap = doc.data();
      folderData.path = getFolderPath(folderPathsMap, folderData.id);
      return res.json(folderData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

// create folder
exports.createFolder = (req, res) => {
  console.log(req.user.isAdmin);
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unauthorized" });
  } else if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  // move request params to JS object
  const parentFolderId = req.params.folderId;
  const folderTitle = req.body.title;
  const newFolder = {
    parent: parentFolderId,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    title: folderTitle,
    content: "",
  };

  // add newFolder to FB database
  db.collection("folders")
    .add(newFolder)
    .then((doc) => {
      newFolder.id = doc.id;

      // update paths map
      return db.doc("/paths/folders").get();
    })
    .then((doc) => {
      if (!doc.exists) {
        return res.status(500).json({ error: "Folder not found" });
      }
      const newFolderPathsMap = doc.data();
      const newFolderPathContents = {};
      newFolderPathContents.parentId = parentFolderId;
      newFolderPathContents.name = folderTitle;
      newFolderPathsMap[newFolder.id] = newFolderPathContents;
      db.doc(`/paths/folders`).update(newFolderPathsMap);

      newFolder.path = getFolderPath(newFolderPathsMap, newFolder.id);
      res.json(newFolder);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteFolder = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unathorized" });
  }
  const batch = db.batch();
  const folderRef = db.doc(`/folders/${req.params.folderId}`);
  const folderPathsMapRef = db.collection("paths").doc("folders");
  folderRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Folder doesn't exist" });
      }
      batch.delete(folderRef);
      batch.update(folderPathsMapRef, { [doc.id]: FieldValue.delete() });
      return batch.commit();
    })
    .then(() => {
      res.json({ message: "Folder deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.updateOneFolder = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }

  try {
    const updatedFolderId = req.params.folderId;
    const updatedFolder = {
      parent: req.body.parent,
      title: req.body.title,
      content: req.body.content,
      lastModified: new Date().toISOString(),
    };
    const updatedFolderPathObj = {
      parentId: req.body.parent,
      name: req.body.title,
    };
    const folderRef = db.doc(`/folders/${updatedFolderId}`);
    const folderPathsMapRef = db.collection("paths").doc("folders");
    const batch = db.batch();
    batch.update(folderRef, updatedFolder);
    batch.update(folderPathsMapRef, {
      [updatedFolderId]: updatedFolderPathObj,
    });
    return batch.commit().then(() => {
      return res.json({ message: "Folder updated successfully " });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};
