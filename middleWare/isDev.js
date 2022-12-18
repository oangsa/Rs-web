module.exports = (req, res, next) => {
    
    if(req.session.isDev) {
            next();
    } else {
        res.render("dev/devLogin", {
            name: "",
            pass: ""
        })
    }
}