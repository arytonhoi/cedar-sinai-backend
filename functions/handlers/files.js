const { db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

// get all files in database
exports.getAllFiles = (req, res) => {
    if (req.method !== "GET") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    db.collection("files")
        .orderBy("lastModified", "desc")
        .get()
        .then((data) => {
            let files = [];
            data.forEach((doc) => {
                let file = doc.data();
                file.fileId = doc.id;
                files.push(file);
            });
            return res.json(files);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// get single file
exports.getFile = (req, res) => {
    if (req.method !== "GET") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    let fileData = {};
    db.doc(`/files/${req.params.fileId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "File not found" });
            }
            fileData = doc.data();
            fileData.fileId = doc.id;
            // if file is a folder, get all folder contents
            if (fileData.type === "folder") {
                console.log(fileData.parent);
                return db
                    .collection("files")
                    .orderBy("lastModified", "desc")
                    .where("parent", "==", fileData.fileId)
                    .get();
            } else {
                return [];
            }
        })
        .then((maybeFolderContents) => {
            console.log(maybeFolderContents);
            if (fileData.type === "folder") {
                // add folder contents to folder object
                fileData.contents = [];
                maybeFolderContents.forEach((content) => {
                    fileData.contents.push(content.data());
                });
            }
            return res.json(fileData);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "something went wrong" });
        });
};

// create file
exports.createFile = (req, res) => {
    console.log(req.user.isAdmin)
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    } else if (req.method !== "POST") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    try{req = fixFormat(req)}catch(e){return res.status(400).json({error: "Invalid JSON."})}
    // move request params to JS object newFIle
    const newFile = {
        parent: req.params.fileId,
        type: req.body.type,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        title: req.body.title,
    };
    // additional properties based on fileType
    if (
        req.body.type === "pdf" ||
        req.body.type === "video" ||
        req.body.type === "image"
    ) {
        newFile.link = req.body.link;
        newFile.caption = req.body.caption;
        newFile.thumbnailImgUrl = req.body.thumbnailImgUrl;
    } else if (req.body.type === "document") {
        newFile.content = req.body.content;
    } else if (req.body.type === "folder") {
        newFile.content = [];
    }

    // add newFile to FB database and update parent folder
    db.collection("files")
        .add(newFile)
        .then((doc) => {
            newFile.fileId = doc.id;
            res.json(newFile);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "something went wrong" });
        });
};

exports.deleteFile = (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    }
    const document = db.doc(`/files/${req.params.fileId}`);
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "File doesn't exist"})
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({message: 'File deleted successfully'});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}
