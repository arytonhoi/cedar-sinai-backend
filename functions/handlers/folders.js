const { db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

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
        folderData.subfolders.push(content.data());
      });
      return res.json(folderData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
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
  // move request params to JS object newFIle
  const newFolder = {
    parent: req.params.folderId,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    title: req.body.title,
    content: "",
  };

  // add newFolder to FB database
  db.collection("folders")
    .add(newFolder)
    .then((doc) => {
      newFolder.id = doc.id;
      res.json(newFolder);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
};

exports.deleteFolder = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unathorized" });
  }
  const document = db.doc(`/folders/${req.params.folderId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Folder doesn't exist" });
      } else {
        return document.delete();
      }
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
  const updatedFolder = {
    parent: req.body.parent,
    title: req.body.title,
    content: req.body.content,
    lastModified: new Date().toISOString(),
  };

  db.doc(`/folders/${req.params.folderId}`)
    .update(updatedFolder)
    .then(() => {
      return res.json({ message: "Folder updated successfully " });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
