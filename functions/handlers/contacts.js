const { db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

// create file
exports.postOneDepartment = (req, res) => {
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
  const newDepartment = {
    name: req.body.name,
  };

  // add newAnn to FB database and update parent folder
  db.collection("departments")
    .add(newDepartment)
    .then((doc) => {
      newDepartment.departmentId = doc.id;
      res.json(newDepartment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
};

exports.deleteOneDepartment = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const department = db.doc(`/departments/${req.params.departmentId}`);
  department
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "department doesn't exist" });
      } else {
        return department.delete();
      }
    })
    .then(() => {
      res.json({ message: "department deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.updateOneDepartment = (req, res) => {
  try {
    req = fixFormat(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  const updatedDepartment = {
    name: req.body.name,
  };

  db.doc(`/departments/${req.params.departmentId}`)
    .update(updatedDepartment)
    .then(() => {
      return res.json({ message: "Department updated successfully " });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// get all contacts in database
exports.getAllContacts = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  db.collection("contacts")
    .get()
    .then((data) => {
      let departments = [];
      data.forEach((doc) => {
        let department = doc.data();
        department.departmentId = doc.id;
        departments.push(department);
      });
      return res.json(departments);
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
