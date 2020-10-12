const { db } = require("../util/admin");
const { fixFormat } = require("../util/shim");

// get all announcements in database
exports.getAllSchedules = (req, res) => {
    if (req.method !== "GET") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    db.collection("schedules")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let schedules = [];
            data.forEach((doc) => {
                let schedule = doc.data();
                schedule.scheduleId = doc.id;
                schedules.push(schedule);
            });
            return res.json(schedules);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// create file
exports.postOneSchedule = (req, res) => {
    console.log(req.user.isAdmin)
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    } else if (req.method !== "POST") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    try{req = fixFormat(req)}catch(e){return res.status(400).json({error: "Invalid JSON."})}
    // move request params to JS object newFIle
    const newSchedule = {
        title: req.body.title,
        createdAt: new Date().toISOString(),
        content: req.body.content,
        comments: req.body.comments,
    };

    // add newAnn to FB database and update parent folder
    db.collection("schedules")
        .add(newSchedule)
        .then((doc) => {
            newSchedule.scheduleId = doc.id;
            res.json(newSchedule);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "something went wrong" });
        });
};

exports.deleteOneSchedule = (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    }
    const schedule = db.doc(`/schedules/${req.params.scheduleId}`);
    schedule.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Schedule doesn't exist"})
            } else {
                return schedule.delete();
            }
        })
        .then(() => {
            res.json({message: 'Schedule deleted successfully'});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

// exports.updateOneAnnouncement = (req, res) => {
//     let userDetails = reduceUserDetails(req.body);
//     db.doc(`/users/${req.user.handle}`)
//         .update(userDetails)
//         .then(() => {
//             return res.json({ message: "Details added successfully " });
//         })
//         .catch((err) => {
//             console.error(err);
//             return res.status(500).json({ error: err.code });
//         });
// }
