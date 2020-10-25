const { db } = require("../util/admin");
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
        contact.contactId = doc.id;
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
  console.log(req.user.isAdmin);
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unathorized" });
  } else if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }

  // move request params to JS object newFIle
  const newContact = {
    name: req.body.name,
    imgUrl: req.body.imgUrl,
    departmentId: req.body.departmentId,
    phone: req.body.phone,
    email: req.body.email,
  };

  // add newAnn to FB database and update parent folder
  db.collection("contacts")
    .add(newContact)
    .then((doc) => {
      newContact.contactId = doc.id;
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
