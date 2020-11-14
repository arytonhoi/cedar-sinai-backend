const { admin, db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

// get all contacts in database
exports.getAllContacts = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  db.collection("contacts")
    .get()
    .then((data) => {
      let contacts = [];
      data.forEach((doc) => {
        let contact = doc.data();
        contact.id = doc.id;
        contacts.push(contact);
      });
      return res.json(contacts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// create file
exports.postOneContact = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unathorized" });
  } else if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }

  // move request params to JS object newFIle
  const newContact = {
    departmentId: req.body.departmentId,
    name: req.body.name,
    imgUrl: req.body.imgUrl,
    phone: req.body.phone,
    email: req.body.email,
  };

  // add newAnn to FB database and update parent folder
  db.collection("contacts")
    .add(newContact)
    .then((doc) => {
      newContact.id = doc.id;
      res.json(newContact);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
};

exports.deleteOneContact = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unathorized" });
  }

  const contact = db.doc(`/contacts/${req.params.contactId}`);
  contact
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "contact doesn't exist" });
      } else {
        return contact.delete();
      }
    })
    .then(() => {
      res.json({ message: "contact deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.updateOneContact = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  const updatedContact = {
    name: req.body.name,
    imgUrl: req.body.imgUrl,
    departmentId: req.body.departmentId,
    phone: req.body.phone,
    email: req.body.email,
  };

  db.doc(`/contacts/${req.params.contactId}`)
    .update(updatedContact)
    .then(() => {
      return res.json({ message: "Contact updated successfully " });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// upload a profile image
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let thumbnailFilename;
  let imageToBeUploaded = {};
  const contactId = req.params.contactId;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${contactId}.${imageExtension}`;
    thumbnailFilename = `${contactId}_200X200.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${thumbnailFilename}?alt=media`;
        return db.doc(`/contacts/${contactId}`).update({ imgUrl: imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};
