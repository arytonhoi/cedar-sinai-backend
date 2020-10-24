const { db } = require("../util/admin")
const { fixFormat } = require("../util/shim");


// get all announcements in database
exports.getAllAnnouncements = (req, res) => {
    if (req.method !== "GET") {
        return res.status(400).json({ error: "Method not allowed" });
    }
    db.collection("announcements")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let announcements = [];
            data.forEach((doc) => {
                let announcement = doc.data();
                announcement.announcementId = doc.id;
                announcements.push(announcement);
            });
            return res.json(announcements);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// create file
exports.postOneAnnouncement = (req, res) => {
    try{req = fixFormat(req)}catch(e){return res.status(400).json({error: "Invalid JSON."})}
    console.log(req.user.isAdmin)
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    } else if (req.method !== "POST") {
        return res.status(400).json({ error: "Method not allowed" });
    }

    // move request params to JS object newFIle
    const newAnn = {
        title: req.body.title,
        author: req.body.author,
        createdAt: new Date().toISOString(),
        isPinned: req.body.isPinned,
        content: req.body.content,
    };

    // add newAnn to FB database and update parent folder
    db.collection("announcements")
        .add(newAnn)
        .then((doc) => {
            newAnn.announcementId = doc.id;
            res.json(newAnn);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "something went wrong" });
        });
};

exports.deleteOneAnnouncement = (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unathorized" });
    }

    const announcement = db.doc(`/announcements/${req.params.announcementId}`);
    announcement.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Announcement doesn't exist"})
            } else {
                return announcement.delete();
            }
        })
        .then(() => {
            res.json({message: 'Announcement deleted successfully'});
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
