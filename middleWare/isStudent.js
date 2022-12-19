const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    if (req.session.isStudent) {
        return next();
    } else {
        res.render("logStudent", {
            name: "",
            pass: ""
        })
    }
}