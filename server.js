const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = 3000 || process.env.PORT
// ==> OLD 
const DevNotify = require('line-notify-nodejs')('pjLFmKaRFgJrgeO0WjGbqmloRIXpcj2VwdJQttDoCYr');
// ==> NEW
const lineNotify = require('line-notify-nodejs')('UA5YDrPULtLGGhlR5WR9XzTykGPJD6e7UUiyGOwAc6F');
const path = require("path");
const compareWeek = require('compare-week');
const dbURL = "mongodb+srv://oangsa:oangsa58528@cluster0.q9lfhle.mongodb.net/?retryWrites=true&w=majority";
const devDbURL = "mongodb+srv://oangsa:oangsa58528@dev.x91artd.mongodb.net/?retryWrites=true&w=majority";
const prodDB = mongoose.createConnection(dbURL);
const devDB = mongoose.createConnection(devDbURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const notesSchema = {
    name: String,
    class_num: String,
    total_days: Number,
    week_days: Number,
    allDates: Array,
    weekDates: Array,
    nweekDate: Array,
    ndates: Array,
    stats: String,
    reason: String
}

const Note = prodDB.model("RS", notesSchema)
const devNote = devDB.model("DevRS", notesSchema)

app.get("/", function(req,res,next) {
    res.render("index")
    next();
})

app.get("/dev", async function(req, res) {
    res.render("dev")
})

app.get("/data_table", function(req,res) {
    Note.find({}, function(err, user){
        res.render("table",{
            dataLists: user
        })
    })
})

app.get("/stats", function(req,res) {
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

app.get("/dont-enter-this-url-please", function(req,res){
    res.render("rstrash")
})

app.post("/rs-really-trash", function(req,res){
    res.redirect("https://youtu.be/dQw4w9WgXcQ")
})

app.post("/dev", async function(req, res) {
    const name = req.body.name
    const reason = req.body.reason
    const otherreason = req.body.other_reason
    const half = req.body.half_day || ""
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
    const fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
    const THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
    const date_1 = new Date(fdate_1);
    const dtt = new Date().toUTCString({timeZone: "Asia/Bangkok"})
    var r = otherreason
    if (half == "ทั้งวัน" || half == ""){
        var day = `${d}`
    } else {
        var day = `${d}${half}`
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
    const freason = reasonDict[reason] || otherreason
    console.log(otherreason)
    const dic = { 
        "ศาสตร์ศิลป์ จับโจร":"1", 
        "ปริพรรษ์ จันทร์คุณาภาส":"2", 
        "ภคิน ไชยพรม":"3", 
        "ภวัต ขอเหนี่ยวกลาง":"4", 
        "ยอดยชญ์ภูมิ ภิญโญ":"5", 
        "วุฒินนท์ โชคเหมาะ":"6", 
        "ปุญญพัฒน์ ตองอ่อน":"7", 
        "พัฒนพงศ์ ขวัญมา":"8", 
        "ภูวรินทร์ ไตรจักรปราณี":"9", 
        "วชิรวิทย์ สืบกระแสร์":"10", 
        "เขมวรรธน์ หีบสระน้อย":"11", 
        "จิรภัทร ประจิมนอก":"12", 
        "ธนพล อนันฤทธิ์":"13", 
        "ณฐกร กุลจิรภัทร์":"14", 
        "สุรขวัญชัย จุลเกาะ":"15", 
        "อรรถพร ปรีชาชาญ":"16", 
        "กฤษฎิ์ ผาสุขนิตย์":"17", 
        "ธนโชติ เยื่ยมสระน้อย":"18", 
        "พงศ์ปณต พรหมพันธ์ใจ":"19", 
        "ภีมวัศ อเบอร์โครบี้":"20", 
        "เตชินท์ บุญยศ":"21", 
        "ภัทรพันธ์ ชูธรัตน์":"22", 
        "กิตติมศักดิ์ เขตกลาง":"23",
        "นราวิชญ์ วรรัตน์โภคา":"24", 
        "ภูธเนศ งาจันทึก":"25", 
        "มโนรัฐ หอมจะบก":"26", 
        "สุธางค์ สุขเรืองกูล":"27", 
        "กันตธีร์ พงศ์ไพสิทธิ์":"28", 
        "กนกพล ธงกระโทก":"29", 
        "พงษ์พิทักษ์ ดิบประโคน":"30", 
        "วิศิษฐวรชาติ วิศวเลิศทรัพย์":"31", 
        "สรศักดิ์ คิดทำ":"32", 
        "อภิสิทธิ์ สมดี":"33", 
        "ปฏิภาณวัฒน์ ชาชำนาญ":"34", 
        "ปณิธาน พลเสนา":"35", 
        "ศักดิ์สิทธิ์ หวังอ้อมกลาง":"36", 
        "พัสกร เชื้อจันทึก":"37", 
        "ณรรชถปกร เรืองนิคม":"38", 
        "กุญช์ภัสส์ หาญเวช":"39", 
        "ชาญนาวิน จำปา":"40", 
        "ฐิติรัตน์ อภิโชติศาสตร์":"41", 
        "ธนกร กระจ่างธิมาพร":"42", 
        "พิตรพิบูล ศิริกุล":"43", 
        "สรยุทธ ช่างเหล็ก":"44", 
    }
    const isBeforeToday = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }
    const getBusinessDatesCount = (startDate, endDate) => {
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
    const alert = (send, icon, title, msg) => {
        res.status(201).render("dev", {
            animate: false,
            sendAlert : true,
            icon: icon,
            title: title,
            msg: msg
        });
        if (send){
            DevNotify.notify({
            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}\n\nversion: dev 2.0.0`,
            })
        }
    }
    const diff = getBusinessDatesCount(date_1, date_1);
    const check_week = compareWeek(new Date(dtt), new Date(req.body.fdate))
    console.log(`${check_week}\nD1: ${new Date(dtt)}\nD2: ${new Date(req.body.fdate)}\ndtt: ${dtt}`)
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
    else {
        devNote.findOne({"name":name}, async function(err, result) {
            if (!result) {
                let newNote = new devNote({
                    name: name,
                    class_num: dic[name],
                    total_days: diff,
                    week_days: diff,
                    allDates: THdate_1,
                    weekDates: THdate_1,
                    ndates: req.body.fdate,
                    nweekDate: req.body.fdate,
                    stats: "❌",
                    reason: freason
                })
                await newNote.save();
                alert(true, "success", "สำเร็จ" , "ระบบบันทึกข้อมูลเรียบร้อย")
            } else {
                if (result.class_num != dic[name]){
                    devNote.updateOne({name: name}, {$set: {class_num: dic[name]}}, async (err, su) => {
                        if (err) return console.log(err)
                    })
                }
                devNote.findOne({"name":name}, function(err, result) {
                    console.log(`Pass ${result.allDates?.includes(THdate_1)}`)
                    if (result.allDates?.includes(THdate_1)) {
                        console.log("Date Failed!")
                        const error_msg = "คุณได้ทำการลาในวันดังกล่าวไปแล้ว!"
                        alert(false, "error", "Same Date!" , error_msg)
                    } else {
                        devNote.updateOne({"name":name},
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

app.post("/", async function(req,res) {
    const name = req.body.name
    const reason = req.body.reason
    const otherreason = req.body.other_reason
    const half = req.body.half_day || ""
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
    const fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
    const THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
    const date_1 = new Date(fdate_1);
    const dtt = new Date().toUTCString({timeZone: "Asia/Bangkok"})
    var r = otherreason
    if (half == "ทั้งวัน" || half == ""){
        var day = `${d}`
    } else {
        var day = `${d}${half}`
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
    const freason = reasonDict[reason] || otherreason
    console.log(otherreason)
    const dic = { 
        "ศาสตร์ศิลป์ จับโจร":"1", 
        "ปริพรรษ์ จันทร์คุณาภาส":"2", 
        "ภคิน ไชยพรม":"3", 
        "ภวัต ขอเหนี่ยวกลาง":"4", 
        "ยอดยชญ์ภูมิ ภิญโญ":"5", 
        "วุฒินนท์ โชคเหมาะ":"6", 
        "ปุญญพัฒน์ ตองอ่อน":"7", 
        "พัฒนพงศ์ ขวัญมา":"8", 
        "ภูวรินทร์ ไตรจักรปราณี":"9", 
        "วชิรวิทย์ สืบกระแสร์":"10", 
        "เขมวรรธน์ หีบสระน้อย":"11", 
        "จิรภัทร ประจิมนอก":"12", 
        "ธนพล อนันฤทธิ์":"13", 
        "ณฐกร กุลจิรภัทร์":"14", 
        "สุรขวัญชัย จุลเกาะ":"15", 
        "อรรถพร ปรีชาชาญ":"16", 
        "กฤษฎิ์ ผาสุขนิตย์":"17", 
        "ธนโชติ เยื่ยมสระน้อย":"18", 
        "พงศ์ปณต พรหมพันธ์ใจ":"19", 
        "ภีมวัศ อเบอร์โครบี้":"20", 
        "เตชินท์ บุญยศ":"21", 
        "ภัทรพันธ์ ชูธรัตน์":"22", 
        "กิตติมศักดิ์ เขตกลาง":"23",
        "นราวิชญ์ วรรัตน์โภคา":"24", 
        "ภูธเนศ งาจันทึก":"25", 
        "มโนรัฐ หอมจะบก":"26", 
        "สุธางค์ สุขเรืองกูล":"27", 
        "กันตธีร์ พงศ์ไพสิทธิ์":"28", 
        "กนกพล ธงกระโทก":"29", 
        "พงษ์พิทักษ์ ดิบประโคน":"30", 
        "วิศิษฐวรชาติ วิศวเลิศทรัพย์":"31", 
        "สรศักดิ์ คิดทำ":"32", 
        "อภิสิทธิ์ สมดี":"33", 
        "ปฏิภาณวัฒน์ ชาชำนาญ":"34", 
        "ปณิธาน พลเสนา":"35", 
        "ศักดิ์สิทธิ์ หวังอ้อมกลาง":"36", 
        "พัสกร เชื้อจันทึก":"37", 
        "ณรรชถปกร เรืองนิคม":"38", 
        "กุญช์ภัสส์ หาญเวช":"39", 
        "ชาญนาวิน จำปา":"40", 
        "ฐิติรัตน์ อภิโชติศาสตร์":"41", 
        "ธนกร กระจ่างธิมาพร":"42", 
        "พิตรพิบูล ศิริกุล":"43", 
        "สรยุทธ ช่างเหล็ก":"44", 
    }
    const isBeforeToday = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }
    const getBusinessDatesCount = (startDate, endDate) => {
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
    const alert = (send, icon, title, msg) => {
        res.status(201).render("index", {
            sendAlert : true,
            icon: icon,
            title: title,
            msg: msg
        });
        if (send){
            lineNotify.notify({
            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}\n\nVersion: release 1.0.20`,
            })
        }
    }
    const diff = getBusinessDatesCount(date_1, date_1);
    const check_week = compareWeek(new Date(dtt), new Date(req.body.fdate))
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
    else {
        Note.findOne({"name":name}, async function(err, result) {
            if (!result) {
                let newNote = new Note({
                    name: name,
                    class_num: dic[name],
                    total_days: diff,
                    week_days: diff,
                    allDates: THdate_1,
                    weekDates: THdate_1,
                    ndates: req.body.fdate,
                    nweekDate: req.body.fdate,
                    stats: "❌",
                    reason: freason
                })
                await newNote.save();
                alert(true, "success", "สำเร็จ" , "ระบบบันทึกข้อมูลเรียบร้อย")
            } else {
                if (result.class_num != dic[name]){
                    Note.updateOne({name: name}, {$set: {class_num: dic[name]}}, async (err, su) => {
                        if (err) return console.log(err)
                    })
                }
                Note.findOne({"name":name}, function(err, result) {
                    console.log(`Pass ${result.allDates?.includes(THdate_1)}`)
                    if (result.allDates?.includes(THdate_1)) {
                        console.log("Date Failed!")
                        const error_msg = "คุณได้ทำการลาในวันดังกล่าวไปแล้ว!"
                        alert(false, "error", "Same Date!" , error_msg)
                    } else {
                        Note.updateOne({"name":name},
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
app.use("/", (req, res) => {
    res.status(404).send(res.render("err"))
})

app.listen(PORT , function() {
    console.log(`Server is running on port ${PORT}`)
})