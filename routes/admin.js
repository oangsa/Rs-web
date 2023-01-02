let express = require('express');
let router = express.Router();
let isAuth = require("../middleWare/isAuth")
let Note = require("../libs/db")


router.get('/',isAuth, (req, res, next) => {
    Note.find({}, function(err, user){
        if (err) {
            res.render('admin', {data: ""});
        }
        else {
            res.render('admin', {data: user});
        }
    }).sort("class_num")
})

router.post("/gologin", async (req, res, next) => {
    let { name, pass } = req.body;
    if (name === "admin" && pass === "password") {
        req.session.isAuth = true
        req.session.isAuth.maxAge = 3600;
        if (req.session.isAuth === true) return res.redirect("/admin");
    } else {
        res.render("login",{
            name: name,
            pass: "",
            sendAlert: true,
            icon: "error",
            title: "ไม่สำเร็จ",
            msg: "Authenticate Failed!"
        })
    }
})

router.post('/logout', async (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/login")
    })
})

router.get("/add", isAuth, (req, res, next) => {
    res.render("admin/add", {
        name: "",
        number: "",
        studentId: "",
        studentClass: "",
    })
})

router.post('/add', async (req, res, next) => {
    let name = req.body.name;
    let number = req.body.number;
    let id = req.body.studentId;
    let studentClass = req.body.class;
    console.log(id.length)
    let Alert = (send, icon, title, msg) => {
        res.status(201).render("admin/add", {
            sendAlert : send,
            name: "",
            number: "",
            studentId:"",
            studentClass:"",
            icon: icon,
            title: title,
            msg: msg
        });
    }

    if (name === "" || number === "") {
        Alert(true, name, number, "error", "ไม่สำเร็จ", "กรุณากรอกข้อมูลด้วย");
    }
    else if (isNaN(parseInt(number))) {
        Alert(true, name, number, "error", "ไม่สำเร็จ", "กรุณากรอกเลขที่ให้ถูกต้อง");
    } 
    else if (isNaN(parseInt(id)) || id.length !== 5) {
        Alert(true, name, number, "error", "ไม่สำเร็จ", "กรุณากรอกเลขประจำตัวนักเรียนให้ถูกต้อง");
    } 
    else {
        Note.findOne({class_num: number, name: name, class: studentClass, studentId: id}, async function(err, user){
            if (!user){
                let newNote = new Note({
                    name: name,
                    studentId: id,
                    class_num: number,
                    class: studentClass,
                    total_days: 0,
                    week_days: 0,
                    allDates: {},
                    weekDates: {},
                    ndates: {},
                    nweekDate: {},
                    stats: "✅",
                    reason: ""
                })
                await newNote.save();
                Alert(true, "success", "สำเร็จ", "ระบบบันทึกข้อมูลแล้ว");
            }
            else return Alert(true, "error", "ไม่สำเร็จ", "มีนักเรียนคนดังกล่าวในระบบแล้ว");
        })    
    }
})

router.get("/edit/(:id)",isAuth, async (req, res, next) => {
    let id = req.params.id;

    Note.findOne({studentId: id}, async function(err, user){
        if (!user) {
            res.redirect("/admin")
        } else {
            console.log(user.name)
            res.render("admin/edit", {
                name: user.name,
                number: user.class_num,
                studentId: user.studentId || "",
                studentClass: user.class || "",
            });
        }
    })
})

router.post("/edit/:id", async (req, res, next) => {
    let id = req.params.id;
    let name = req.body.name;
    let number = req.body.number;
    let studentId = req.body.id;
    let studentClass = req.body.class;
    console.log(studentId)

    let Alert = (send, name, studentId, studentClass, number, icon, title, msg, id) => {
        res.status(201).render("admin/edit", {
            sendAlert : send,
            name: name,
            studentId: studentId,
            studentClass: studentClass,
            number: number,
            icon: icon,
            title: title,
            msg: msg,
            id: id
        });
    }

    Note.findOne({class_num: id}, async function(err, user){
        if (!user) {
            res.redirect("/admin", {
                sendAlert : true,
                icon: "error",
                title: "ไม่สำเร็จ",
                msg: "หาคนนี้ไม่เจอแล้ว ??"
            })
        } else {
            if (name === "" || number === "" || studentClass === "" || studentId === "") {
                console.log("TEST")
                Alert(true, user?.name, user?.studentId, user?.class, user?.class_num, "error", "ไม่สำเร็จ", "กรุณากรอกข้อมูลด้วย", id)
            } else {
                Note.updateOne({class_num: id}, {$set: {class_num: number, name: name, studentId: studentId, class: studentClass}}, async (err, su) => {
                    if (err) return console.log(err)
                    else return Alert(true, name, studentId, studentClass, number, "success", "สำเร็จ", "ระบบบันทึกข้อมูลแล้ว", id)
                })
            }
        }
    })
})

router.get("/remove/(:id)",isAuth, async (req, res, next) => {
    let id = req.params.id

    let Alert = (send, icon, title, msg) => {
        Note.find({}, async function(err, user){
            if (err) {
                res.render('admin', {data: ""});
            }
            else {
                res.redirect("/admin")
            }
        })
    }

    Note.deleteOne({studentId: id}, async (err, user) => {
        if (err) return console.log(err)
        else return Alert(true, "success", "สำเร็จ", "ระบบบันทึกข้อมูลแล้ว")
    })
})


module.exports = router;