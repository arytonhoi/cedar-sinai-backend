const { db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

// get all departments in database
exports.getAllDepartments = (req, res) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  db.collection("departments")
    .get()
    .then((data) => {
      let departments = [];
      data.forEach((doc) => {
        let department = doc.data();
        department.id = doc.id;
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
  try {
    const newDepartment = {
      name: req.body.name,
    };

    // add newAnn to FB database and update parent folder
    db.collection("departments")
      .add(newDepartment)
      .then((doc) => {
        newDepartment.id = doc.id;
        res.json(newDepartment);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "something went wrong" });
      });
  } catch (e) {
    return res
      .status(400)
      .json({ error: "JSON incomplete. Required keys are name" });
  }
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
        return res
          .status(404)
          .json({ error: "Cannot delete nonexistent department." });
      } else {
        return department.delete();
      }
    })
    .then(() => {
      res.json({ message: "Department deleted successfully" });
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
  if (Object.keys(req.body).length > 0) {
    const updatedDepartment = {
      ...req.body,
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
  } else {
    return res.json({ message: "No changes were made." });
  }
};
