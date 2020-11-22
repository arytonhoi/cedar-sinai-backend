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
  try {
    const newContact = {
      departmentId: req.body.departmentId,
      name: req.body.name,
      imgUrl: req.body.imgUrl,
      phone: req.body.phone,
      email: req.body.email,
    };

    // add newContact to FB database and update parent folder
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
  } catch (e) {
    return res.status(400).json({
      error:
        "JSON incomplete. Required keys are departmentId, name, imgUrl, phone, email",
    });
  }
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
  if (Object.keys(req.body).length > 0) {
    var updatedContact = {
      ...req.body,
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
  } else {
    return res.json({ message: "No changes were made." });
  }
};
