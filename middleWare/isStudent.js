const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    
    // const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookie?.jwt

    // if (!token) {
    //     console.log(token)
    //     res.render("logStudent", {
    //         name: "",
    //         pass: ""
    //     })
    // }

    // try {
    //     const decoded = jwt.verify(token, "super secret");
    //     req.user = decoded;
    //     console.log("HELLO")
    // } catch (err) {

    //     console.log(err)

    //     res.render("logStudent", {
    //         name: "",
    //         pass: ""
    //     })
    // }

    // return next();

    if(req.session.isStudent) {
        return next();
    } else {
        res.render("logStudent", {
            name: "",
            pass: ""
        })
    }
}