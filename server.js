const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = 3000 || process.env.PORT
// ==> OLD 
// const lineNotify = require('line-notify-nodejs')('pjLFmKaRFgJrgeO0WjGbqmloRIXpcj2VwdJQttDoCYr');
// ==> NEW
const lineNotify = require('line-notify-nodejs')('UA5YDrPULtLGGhlR5WR9XzTykGPJD6e7UUiyGOwAc6F');
const path = require("path");
const axios = require("axios");
const webhook_id = "1014200734146904065"
const webhook_token = "OXGg2D3-PHWTAgJsUM5DDyB3LGP2zWxLMzOuFyVcddEPepHKoMS2evi0r81IqujneaFx"
const compareWeek = require('compare-week');

mongoose.connect("mongodb+srv://oangsa:oangsa58528@cluster0.q9lfhle.mongodb.net/?retryWrites=true&w=majority",{
    useUnifiedTopology: true,
    useNewUrlParser: true
})

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
    stats: String
}

const Note = mongoose.model("RS", notesSchema)

app.get("/", function(req,res,next) {
    res.render("index")
    next();
})

app.get("/data_table", function(req,res) {
    Note.find({}, function(err, user){
        res.render("table",{
            dataLists: user
        })
    })
})

app.get("/stats", function(req,res) {
    const date = new Date()
    console.log(date)
    Note.find({}, async function(err, user){
        await user.forEach(element => {
            const comweek = compareWeek(new Date(element?.nweekDate[0]), new Date())
            console.log(`${element.name}: ${element.allDates?.includes(date)} Comweeks: ${comweek}`)
            if (!comweek) {
                Note.updateOne({name:element.name}, {$set: {"weekDates":[],"nweekDate":[], "week_days":0} }, async (err, succ) => {
                    if(err) return console.log(err)
                })
            }
            if (element?.stats == undefined) {
                if (element.allDates?.includes(date)){
                    Note.updateOne({name:element.name}, {$set: {"stats": "❌"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                } else {
                    Note.updateOne({name:element.name}, {$set: {"stats": "✅"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                }
            } else {
                if (element.allDates?.includes(date)){
                    Note.updateOne({name:element.name}, {$set: {"stats": "❌"}}, async (err, succ) => {
                        if(err) return console.log(err)
                    })
                } else {
                    Note.updateOne({name:element.name}, {$set: {"stats": "✅"}}, async (err, succ) => {
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

app.post("/", async function(req,res) {
    const name = req.body.name
    const reason = req.body.reason
    const half = req.body.half_day || ""
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
    const fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
    const THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
    const date_1 = new Date(fdate_1);
    const date_2 = date_1
    if (half == "ทั้งวัน" || half == ""){
        var day = `${d}`
    } else {
        var day = `${d}${half}`
    }
    const reasonDict = {
        "sick":"ป่วย",
        "covid":"ติดเชื้อโควิด-19",
        "quarantine":"เสี่ยงสูง",
        "parent_activity":"ไปธุระกับผปค.",
        "personal_activity":"กิจกรรม (รด./ อื่นๆ)",
    }
    const freason = reasonDict[reason]
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
    const sucs = () => {
        res.render('index', {
            success: "ระบบบันทึกข้อมูลเรียบร้อย!",
            old_data: req.body
        })
        lineNotify.notify({
            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}`,
        })
    }
    const diff = getBusinessDatesCount(date_1, date_2);
    const check_week = compareWeek(new Date(), new Date(req.body.fdate))
    if (name == "" || !reason || d == "Invalid Date"){
        console.log("Valid date passed!")
        const error_msg = "กรุณากรอกข้อมูลให้ครบ!"
        res.render('index', {
            error: error_msg,
            old_data: req.body
        })
    } 
    else if (diff == 0) {
        console.log("Weekend passed!")
        const error_msg = "คุณไม่สามารถลาในวันหยุดได้(weekend)!"
        res.render('index', {
            error: error_msg,
            old_data: req.body
        })
    }
    else if (!check_week){
        console.log("Next week passed!")
        const error_msg = "คุณไม่สามารถลาในสัปดาห์ถัดไปได้!"
        res.render('index', {
            error: error_msg,
            old_data: req.body
        })
    }
    else if (isBeforeToday(new Date(req.body.fdate))) {
        console.log("Yesterday passed!")
        const error_msg = "คุณไม่สามารถเลือกวันที่จะลาเป็นวันที่เกิดขึ้นก่อนวันนี้ได้!"
        res.render('index', {
            error: error_msg,
            old_data: req.body
        })
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
                    stats: "❌"
                })
                await newNote.save();
                sucs()
            } else {
                if (result.class_num != dic[name]){
                    Note.updateOne({name: name}, {$set: {class_num: dic[name]}}, async (err, su) => {
                        if (err) return console.log(err)
                    })
                }
                Note.findOne({"name":name}, function(err, result) {
                    let Datepass = true
                    for (var i = 0, ln = result["allDates"].length; i < ln; i++) {
                        if (THdate_1.indexOf(result["allDates"][i]) !== -1) {
                          Datepass = false;
                          break;
                        }
                    }
                    console.log(`Pass ${Datepass}`)
                    if (Datepass) {
                        Note.updateOne({"name":name},
                        {total_days:(result["total_days"] + diff),week_days:(diff + result["week_days"]) , $push: { "allDates": THdate_1, "weekDates": THdate_1 , "ndates": req.body.fdate,"nweekDate": req.body.fdate }}, function(err, result){
                            if (err){
                                console.log(err)
                            } else return sucs()
                        })
                    }
                    if (!Datepass) {
                        console.log("Same date passed!")
                        const error_msg = "คุณได้ทำการลาในวันนั้นไปแล้ว!"
                        res.render('index', {
                            error: error_msg,
                            old_data: req.body
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