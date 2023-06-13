let express = require('express');
let router = express.Router();
let compareWeek = require('compare-week');
let lineNotify = require('line-notify-nodejs')('UA5YDrPULtLGGhlR5WR9XzTykGPJD6e7UUiyGOwAc6F');
let isStudent = require("../middleWare/isStudent");
const releaseVersion = "2.5.5";
const Note = require("../libs/db");
const cron = require("node-cron");
const moment = require("moment-timezone");

let isBeforeToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}
let getBusinessDatesCount = (startDate, endDate) => {
    let count = 0;
    let curDate = +startDate;
    while (curDate <= +endDate) {
      const dayOfWeek = new Date(curDate).getDay();
      const isWeekend = (dayOfWeek === 6) || (dayOfWeek === 0);
      if (!isWeekend) {
        count++;
      }
      curDate = curDate + 24 * 60 * 60 * 1000
    }
    return count;
}

const compareWeeks = (week) => {
    const currentWeek = moment().tz("Asia/Bangkok").format("YYYY-WW");
  
    console.log(currentWeek)
    
    if (currentWeek > week || currentWeek < week) {
      return 1;
    } else {
      return 0;
    }
}

cron.schedule('0 10 8 * * *', () => {
    const date = new Date().toLocaleDateString('th-TH', {timeZone: "Asia/Bangkok"})
    const array = [];
    var i = 0;
    Note.find({}, async (err, user) => {
        user.forEach(element => {
            console.log(element.allDates?.includes(date))
            if (element.allDates?.includes(date)){
                i++
                array.push(`${element.name} #${element.class_num}`)
            }
        });
        lineNotify.notify({message: `\nลาทั้งหมด: ${i} คน\n\n${array.join("\n")}\n\nVersion: Release ${releaseVersion}`})
    }).sort("class_num")
    }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
});

router.get('/', isStudent, (req, res, next) => {
    Note.findOne({studentId: req.session.Sid}, async (err, data) => {
        console.log(data)
        res.render("index", {
            dataLists: data
        })
    }) 
})

router.get('/stats', (req, res, next) => {
    const date = new Date().toLocaleDateString('th-TH', {timeZone: "Asia/Bangkok"})
    const dt = new Date().toUTCString({timeZone: "Asia/Bangkok"})
    console.log(date)
    Note.find({}, async function(err, user){
        await user.forEach(element => {
            const comweek = compareWeek(new Date(element?.nweekDate[0]), new Date(dt))
            console.log(`${element.name}: ${element.allDates?.includes(date)} Comweeks: ${comweek}`)
            if (!comweek) {
                Note.updateOne({name:element.name}, {$set: {"weekDates":[],"nweekDate":[], "week_days":0} }, async (err, succ) => {
                    if(err) return console.log(err)
                })
            }
            if (element?.stats == undefined || element?.reason == undefined) {
                if (element.allDates?.includes(date)){
                    Note.updateOne({name:element.name}, {$set: {"stats": "❌"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                } else {
                    Note.updateOne({name:element.name}, {$set: {"stats": "✅", "reason":"-"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                }
            } else {
                if (element.allDates?.includes(date)){
                    Note.updateOne({name:element.name}, {$set: {"stats": "❌"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                } else {
                    Note.updateOne({name:element.name}, {$set: {"stats": "✅", "reason":"-"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                }
            }
        });
        Note.find({}, function(err, user){
            res.render("stats",{
                dataLists: user
            })
        })
    })
})

router.get("/data_table", function(req,res) {
    Note.find({}, function(err, user){
        res.render("table",{
            dataLists: user
        })
    })
})

router.post("/rs-really-trash", function(req,res){
    res.redirect("https://youtu.be/dQw4w9WgXcQ")
})

router.post("/gostudent", async (req, res, next) => {
    let { name, pass } = req.body;
    
    const user = await Note.findOne({studentId:pass})

    if (!user) return res.render("logStudent", { sendAlert: true, icon: "error", title: "ไม่สำเร็จ", msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",  name: name, pass: "" })

    if (name !== user.name.split(" ")[0] && pass !== user.studentId) return res.render("logStudent", { sendAlert: true, icon: "error", title: "ไม่สำเร็จ", msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",  name: name, pass: "" })
    
    console.log(user.studentId)
    req.session.name = user.name;
    req.session.Sid = user.studentId;
    req.session.isStudent = true;
    req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000;
    res.redirect("/")

    // Note.findOne({studentId:pass}, async (err, user) => {
    //     if(!user) {
    //         res.render("logStudent", {
    //             sendAlert: true,
    //             icon: "error",
    //             title: "ไม่สำเร็จ",
    //             msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",
    //             name: name,
    //             pass: ""
    //         })
    //     } else {
    //         if (name === user.name.split(" ")[0] && pass === user.studentId){
    //             console.log(user.studentId)
    //             req.session.name = user.name;
    //             req.session.Sid = user.studentId;
    //             req.session.isStudent = true;
    //             req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000;
    //             res.redirect("/")
    //         }
    //         else {
    //             res.render("logStudent", {
    //                 sendAlert: true,
    //                 icon: "error",
    //                 title: "ไม่สำเร็จ",
    //                 msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",
    //                 name: name,
    //                 pass: ""
    //             })
    //         }
    //     }
    // })
})

router.post('/logout', async (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
})

router.post("/", async function(req,res) {
    const name = req.session.name
    const reason = req.body.reason
    const otherreason = req.body.other_reason
    const half = req.body.half_day || ""
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
    const fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
    const THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
    const tz = moment().tz("Asia/Bangkok");
    const t = moment().tz("Asia/Bangkok");
    var r = otherreason
    if (half == "ทั้งวัน" || half == ""){
        var day = `${d}`
    } else {
        var day = `${d}(${half})`
    }
    if (reason == "personal_activity" && !otherreason){
        var r = "รด."
    }
    const reasonDict = {
        "sick":"ป่วย / ไม่ใช่โควิด",
        "covid":"ติดเชื้อโควิด-19",
        "quarantine":"เสี่ยงสูง/กักตัว",
        "parent_activity":"ลากิจ (ไปธุระกับผปค./ อื่นๆ)",
        "personal_activity":`กิจกรรม (${r})`,
    }
    const alert = (send, icon, title, msg) => {
        Note.findOne({name: name}, async (err, user) => {
            res.status(201).render("index", {
                dataLists: user,
                animate: false,
                sendAlert : true,
                icon: icon,
                title: title,
                msg: msg
            });
        })
        if (send){
            lineNotify.notify({
            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}\n\nVersion: release ${releaseVersion}`,
            })
        }
    }
    const freason = reasonDict[reason] || otherreason
    const diff = getBusinessDatesCount(new Date(fdate_1), new Date(fdate_1));
    const result = compareWeeks(moment(req.body.fdate).tz("Asia/Bangkok").format("YYYY-WW"));
    console.log(`t: ${t}\ntzset: ${tz.set({hour:8,minute:0,second:0,millisecond:0})}\nCHECK TIME: ${t.isBefore(tz.set({hour:23,minute:20,second:0,millisecond:0}))}`)
    if (!name) {
        res.redirect("/")
    }
    else if (name == "" || !reason || d == "Invalid Date"){
        console.log("Empty Entry Error!")
        const error_msg = "กรุณากรอกข้อมูลให้ครบ!"
        alert(false, "error", "Empty Entry!" , error_msg)
    } 
    else if (diff == 0) {
        console.log("Weekend failed!")
        const error_msg = "คุณไม่สามารถลาในวันหยุดได้(weekend)!"
        alert(false, "error", "Date Error!" , error_msg)
    }
    else if (result){
        console.log("Next week failed!")
        const error_msg = "คุณไม่สามารถลาในสัปดาห์ถัดไปได้!"
        alert(false, "error", "Invalid Week!" , error_msg)
    }
    else if (isBeforeToday(new Date(req.body.fdate))) {
        console.log("Yesterday failed!")
        const error_msg = "คุณไม่สามารถเลือกวันที่จะลาเป็นวันที่เกิดขึ้นก่อนวันนี้ได้!"
        alert(false, "error", "Invalid Date!" , error_msg)
    } 
    else if (reasonDict[reason] == undefined && !otherreason){
        console.log("reason failed!")
        const error_msg = "กรุณากรอกข้อมูลให้ครบ"
        alert(false, "error", "Empty Entry!" , error_msg)
    } 
    else if ( t.isAfter(tz.set({hour:8,minute:0,second:0,millisecond:0})) ) {
        console.log("time failed!")
        const error_msg = "ไม่สามารถลาได้ช้ากว่า 8.00 น."
        alert(false, "error", "Time Error!" , error_msg)
    }
    else {
        Note.findOne({studentId: req.session.Sid}, async function(err, result) {
            if (!result) {
                alert(true, "error", "Name Error!" , "WTF this is an impossible error.\nกรุณาส่งให้ developer")
            } else {
                Note.findOne({studentId: req.session.Sid}, function(err, result) {
                    console.log(`Pass ${result.allDates?.includes(THdate_1)}`)
                    if (result.allDates?.includes(THdate_1)) {
                        console.log("Date Failed!")
                        const error_msg = "คุณได้ทำการลาในวันดังกล่าวไปแล้ว!"
                        alert(false, "error", "Same Date!" , error_msg)
                    } else {
                        Note.updateOne({studentId: req.session.Sid},
                        {total_days:(result["total_days"] + diff),week_days:(diff + result["week_days"]) , $push: { "allDates": THdate_1, "weekDates": THdate_1 , "ndates": req.body.fdate,"nweekDate": req.body.fdate }, $set: {"reason": freason}}, function(err, result){
                            if (err){
                                console.log(err)
                            } else return alert(true, "success", "สำเร็จ" , "ระบบบันทึกข้อมูลสำเร็จ")
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;