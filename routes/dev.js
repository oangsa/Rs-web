let express = require('express');
let router = express.Router();
let compareWeek = require('compare-week');
let DevNotify = require('line-notify-nodejs')('pjLFmKaRFgJrgeO0WjGbqmloRIXpcj2VwdJQttDoCYr');
let devNote = require("../libs/devDB")
let Note = require("../libs/db")
const moment = require("moment-timezone");
const cron = require("node-cron")
const devVersion = "3.0.0";

const isDev = require("../middleWare/isDev")

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

cron.schedule('00 30 23 * * *', () => {
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
    }).sort("class_num")
    DevNotify.notify({message: `\nลาทั้งหมด: ${i} คน\n\n${array.join("\n")}\n\nVersion: DEV ${devVersion}`})
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
});

router.post("/gostudent", async function(req, res, next) {
    let { name, pass } = req.body;
    devNote.findOne({studentId:pass}, (err, user) => {
        if(!user) {
            res.render("dev/devLogin", {
                sendAlert: true,
                icon: "error",
                title: "ไม่สำเร็จ",
                msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",
                name: name,
                pass: ""
            })
        } else {
            if (name === user.name.split(" ")[0] && pass === user.studentId){
                req.session.devName = user.name;
                req.session.devId = user.studentId;
                req.session.isDev = true;
                req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000;
                res.redirect("/dev")
            }
            else {
                res.render("dev/devLogin", {
                    sendAlert: true,
                    icon: "error",
                    title: "ไม่สำเร็จ",
                    msg: "ไม่พบผู้ใช้งาน/ รหัสผ่านผิด",
                    name: name,
                    pass: ""
                })
            }
        }
    })
})

router.get("/", isDev, async function(req, res) {
    devNote.findOne({studentId: req.session.devId}, async (err, data) => {
        res.render("dev",{
            dataLists: data
        })
    })
})

router.post("/devsend", isDev, async function(req, res) {
    const name = req.session.devName
    const reason = req.body.reason
    const otherreason = req.body.other_reason
    const half = req.body.half_day || ""
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
    const fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
    const THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
    const date_1 = new Date(fdate_1);
    const dtt = new Date().toUTCString({timeZone: "Asia/Bangkok"})
    const t = moment().tz("Asia/Bangkok");
    const tz = moment().tz("Asia/Bangkok");
    //{timeZone: "Asia/Bangkok"}
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
    // console.log(new Date(req.body.fdate) , new Date(req.body.fdate).getTime(), new Date(req.body.fdate).setHours(8, 0, 0))
    // console.log(new Date(req.body.fdate) > new Date(req.body.fdate).setHours(8, 0, 0))
    // console.log(`CHECK WEEK:${t.isAfter(tz.set({hour:23,minute:0,second:0,millisecond:0}))}`)
    const freason = reasonDict[reason] || otherreason
    const diff = getBusinessDatesCount(date_1, date_1);
    const check_week = compareWeek(new Date(dtt), new Date(req.body.fdate).setHours(0,0,0))
    const alert = (send, icon, title, msg) => {
        devNote.findOne({studentId: req.session.devId}, async (err, user) => {
            res.status(201).render("dev", {
                animate: false,
                sendAlert : true,
                icon: icon,
                title: title,
                msg: msg,
                dataLists: user
            });
        })
        if (send){
            DevNotify.notify({
            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}\n\nVersion: DEV ${devVersion}`,
            })
        }
    }
    console.log(`t: ${t}\ntzset: ${tz.set({hour:8,minute:0,second:0,millisecond:0})}\nCHECK TIME: ${t.isBefore(tz.set({hour:23,minute:20,second:0,millisecond:0}))}\n${check_week}\nD1: ${new Date(dtt)}\nD2: ${new Date(new Date(req.body.fdate))}\ndtt: ${dtt}`)
    if (name == "" || !reason || d == "Invalid Date"){
        console.log("Empty Entry Error!")
        const error_msg = "กรุณากรอกข้อมูลให้ครบ!"
        alert(false, "error", "Empty Entry!" , error_msg)
    } 
    else if (diff == 0) {
        console.log("Weekend failed!")
        const error_msg = "คุณไม่สามารถลาในวันหยุดได้(weekend)!"
        alert(false, "error", "Date Error!" , error_msg)
    }
    else if (!check_week){
        console.log("Next week failed!")
        const error_msg = "คุณไม่สามารถลาในสัปดาห์ถัดไปได้!"
        alert(false, "error", "Invalid Week!" , error_msg)
    }
    else if (isBeforeToday(new Date(req.body.fdate))) {
        console.log("Yesterday failed!")
        const error_msg = "คุณไม่สามารถเลือกวันที่จะลาเป็นวันที่เกิดขึ้นก่อนวันนี้ได้!"
        alert(false, "error", "Invalid Date!" , error_msg)
    } else if (reasonDict[reason] == undefined && !otherreason){
        console.log("reason failed!")
        const error_msg = "กรุณากรอกข้อมูลให้ครบ"
        alert(false, "error", "Empty Entry!" , error_msg)
    }
    else if ( new Date(dtt) > new Date(dtt).setHours(8, 0, 0) ) {
        console.log("time failed!")
        const error_msg = "ไม่สามารถลาได้ช้ากว่า 8.00 น."
        alert(false, "error", "Time Error!" , error_msg)
    }
    else {
        devNote.findOne({studentId: req.session.devId}, async function(err, result) {
            if (!result) {
                alert(true, "error", "NAME ERROR" , "กรุณาส่งให้ developer");
            } else {
                devNote.findOne({studentId: req.session.devId}, function(err, result) {
                    console.log(`Pass ${result.allDates?.includes(THdate_1)}`)
                    if (result.allDates?.includes(THdate_1)) {
                        console.log("Date Failed!")
                        const error_msg = "คุณได้ทำการลาในวันดังกล่าวไปแล้ว!"
                        alert(false, "error", "Same Date!" , error_msg)
                    } else {
                        devNote.updateOne({studentId: req.session.devId},
                        {total_days:(result["total_days"] + diff),week_days:(diff + result["week_days"]) , $push: { "allDates": THdate_1, "weekDates": THdate_1 , "ndates": req.body.fdate,"nweekDate": req.body.fdate }, $set: {"reason": freason}}, function(err, result){
                            if (err){
                                console.log(err)
                            } else return alert(true, "success", "สำเร็จ" , "ระบบบันทึกข้อมูลเรียบร้อย")
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;