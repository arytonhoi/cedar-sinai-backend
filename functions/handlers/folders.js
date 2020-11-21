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

// temporary serach
exports.searchFolders = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  const searchTerm = `${req.params.searchTerm}`;
  const folderPathsMapRef = db.collection("paths").doc("folders");
  // global case insensitive matching
  var regex = new RegExp(searchTerm, "gi");
  db.collection("folders")
    .orderBy("lastModified", "desc")
    .get()
    .then((data) => {
      let folders = [];
      folderPathsMapRef.get().then(fpmr=>{
        fpmrd = fpmr.data()
        data.forEach((doc) => {
          let folder = doc.data();
          folder.id = doc.id;
          folder.path = getFolderPath(fpmrd, folder.id);
          let relevanceCount = 0;
          let titleMatchesArray = folder.title.match(regex);
          let contentMatchesArray = folder.content.match(regex);
          if (titleMatchesArray !== null) {
            relevanceCount += 2 * titleMatchesArray.length;
          }
          if (contentMatchesArray !== null) {
            relevanceCount += contentMatchesArray.length;
          }
        
          if (relevanceCount !== 0) {
            folder.relevanceCount = relevanceCount;
            folders.push(folder);
          }
        });
      }).then(x=>{
        folders.sort((a, b) =>
          a.relevanceCount < b.relevanceCount
            ? 1
            : b.relevanceCount < a.relevanceCount
            ? -1
            : 0
        );
        return res.json(folders)
      })
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// get single folder
exports.getFolder = (req, res) => {
//   return res.status(400).json({ error: req.query });
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
      // maybe increment folder contents
      if(typeof(req.query.i)==="string"){
        db.doc(`/folders/${req.params.folderId}`).update({
          visits: admin.firestore.FieldValue.increment(1)
        })
      }
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
    preferredSort: 0,
    index: 0,
    visits: 0,
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
    return res.status(400).json({ error: err.code });
  }
  if(Object.keys(req.body).length > 0){
    try {
      const folderToUpdate = req.params.folderId;
      const updatedFolderContents = {
        ...req.body,
        lastModified: new Date().toISOString()
      };
      var updatedFolderPathObj = {}
      if(typeof(req.body.parent)==="string"||typeof(req.body.parent)==="number"){
        updatedFolderPathObj.parentId = req.body.parent
      }
      if(typeof(req.body.title)==="string"||typeof(req.body.title)==="number"){
        updatedFolderPathObj.name = req.body.title
      }
      const folderRef = db.doc(`/folders/${folderToUpdate}`);
      const folderPathsMapRef = db.collection("paths").doc("folders");
      const batch = db.batch();
      batch.update(folderRef, updatedFolderContents);
      if(typeof(req.body.parent)==="string"||typeof(req.body.parent)==="number"){
        batch.update(folderPathsMapRef, {[`${folderToUpdate}.parentId`]: req.body.parent})
      }
      if(typeof(req.body.title)==="string"||typeof(req.body.title)==="number"){
        batch.update(folderPathsMapRef, {[`${folderToUpdate}.name`]: req.body.title})
      }
      return batch.commit().then(() => {
        return res.json({ message: "Folder updated successfully." });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.code });
    }
  }else{
    return res.json({ message: "No changes were made." });
  }
};
