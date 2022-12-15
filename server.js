const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require('morgan');
const PORT = 3000 || process.env.PORT
const MongoDBsession = require("connect-mongodb-session")(session)

var indexRouter = require("./routes/index")

app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
const store = new MongoDBsession({
    uri: "mongodb+srv://oangsa:oangsa58528@dev.x91artd.mongodb.net/?retryWrites=true&w=majority",
    collection: "session"
})
app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: false,
    resave: false,
    secret: 'secret',
    store: store
}))

app.use('/', indexRouter);
app.use('/stats', indexRouter);
app.use('/data_table', indexRouter);
app.use('/dev', indexRouter);
app.use('/admin', indexRouter);

app.get("/login", (req, res, next) => {
    res.render("login",{
        name: "",
        pass: ""
    })
})

app.post("/gologin", (req, res, next) => {
    let { name, pass } = req.body;
    if (name === "admin" && pass === "password") {
        req.session.isAuth = true;
        res.redirect("/admin")
    } else {
        res.render("login",{
            name: name,
            pass: "",
            sendAlert: true,
            icon: "error",
            title: "Authenticate Failed!",
            msg: "Invalid Username or Password."
        })
    }
})

app.use("/", (req, res) => {
    res.status(404).send(res.render("err"))
})

app.listen(PORT , function() {
    console.log(`Server is running on port ${PORT}`)
})