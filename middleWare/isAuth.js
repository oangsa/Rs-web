module.exports = (req, res, next) => {
    if(req.session.isAuth || req.session.isDev) {
        next();
    } else {
        res.redirect("/login")
    }
}