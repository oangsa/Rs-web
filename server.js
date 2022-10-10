const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = 3000 || process.env.PORT
const lineNotify = require('line-notify-nodejs')('pjLFmKaRFgJrgeO0WjGbqmloRIXpcj2VwdJQttDoCYr');
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
    ndates: Array
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

app.post("/", async function(req,res) {
        const name = req.body.name
        const reason = req.body.reason
        const half = req.body.half_day
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        const d = new Date(req.body.fdate).toLocaleDateString('TH-th', options)
        let fdate_1 = new Date(req.body.fdate).toLocaleDateString('en-US');
        let THdate_1 = new Date(req.body.fdate).toLocaleDateString('TH-th');
        let date_1 = new Date(fdate_1);
        let date_2 = new Date(fdate_1);
        if (reason == "sick"){
            var freason = "ป่วย"
        } 
        else if (reason == "covid"){
            var freason = "ป่วย"
        }
        else if (reason == "quarantine") {
            var freason = "เสี่ยงสูง"
        }
        else if (reason == "parent_activity") {
            var freason = "ไปธุระกับผปค."
        }
        else if (reason == "personal_activity") {
            var freason = "กิจกรรม"
        }
        dic = {
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
            "ทวีศักดิ์ สีเหลี่อม":"18",
            "ธนโชติ เยื่ยมสระน้อย":"19",
            "พงศ์ปณต พรหมพันธ์ใจ":"20",
            "ภีมวัศ อเบอร์โครบี้":"21",
            "เตชินท์ บุญยศ":"22",
            "ภัทรพันธ์ ชูธรัตน์":"23",
            "กิตติมศักดิ์ เขตกลาง":"24",
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

        var day = d
        if (half == "ทั้งวัน") {
            var day = d
        } else if (half == "ครึ่งเช้า" || half == "ครึ่งบ่าย") {
            var day = `${d}(${half})`
        }
        
        function isBeforeToday(date) {
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
        const diff = getBusinessDatesCount(date_1, date_2);
        const check_week = compareWeek(new Date(), new Date(req.body.fdate))
        if (name == "" || !reason || d == "Invalid Date"){
            const error_msg = "กรุณากรอกข้อมูลให้ครบ!"
            res.render('index', {
                error: error_msg,
                old_data: req.body
            })
        } 
        else if (diff == 0) {
            const error_msg = "คุณไม่สามารถลาในวันหยุดได้(weekend)!"
            res.render('index', {
                error: error_msg,
                old_data: req.body
            })
        }
        else if (!check_week){
            const error_msg = "คุณไม่สามารถลาในสัปดาห์ถัดไปได้!"
            res.render('index', {
                error: error_msg,
                old_data: req.body
            })
        }
        else {
            Note.findOne({"name":name}, function(err, result) {
                if (!result) {
                    if (isBeforeToday(new Date(req.body.fdate))) {
                        const error_msg = "คุณไม่สามารถเลือกวันที่จะลาเป็นวันที่เกิดขึ้นก่อนวันนี้ได้!"
                        res.render('index', {
                            error: error_msg,
                            old_data: req.body
                        })
                    } else {
                        let newNote = new Note({
                            name: name,
                            class_num: dic[name],
                            total_days: diff,
                            week_days: diff,
                            allDates: THdate_1,
                            weekDates: THdate_1,
                            ndates: req.body.fdate,
                            nweekDate: req.body.fdate
                        })
                        const logEmbed = {
                            title: name,
                            description: `\`\`\`ini\nDate\n ⤷ ${day}\nReason\n ⤷ ${freason}\nDate Count\n ⤷ ${diff}\`\`\``,
                            color: 0x99CCFF
                        };
                        const succ_msg = "ระบบบันทึกข้อมูลเรียบร้อย!"
                        newNote.save();
                        res.render('index', {
                            success: succ_msg,
                            old_data: req.body
                        })
                        lineNotify.notify({
                            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}`,
                        })
                        
                        axios.post(`https://discordapp.com/api/webhooks/${webhook_id}/${webhook_token}`, { 
                            "embeds": [logEmbed], 
                            "username":"log" 
                        })
                    
                    }
                } else {
                    Note.findOne({"name":name}, function(err, result) {
                        const comweek = compareWeek(new Date(result["nweekDate"][0]), new Date(req.body.fdate))
                        let pass = true
                        for (var i = 0, ln = result["allDates"].length; i < ln; i++) {
                            if (THdate_1.indexOf(result["allDates"][i]) !== -1) {
                              pass = false;
                              break;
                            }
                        }
                        if (pass == true) {
                            if(!comweek){
                                if (isBeforeToday(new Date(req.body.fdate))) {
                                    const error_msg = "คุณไม่สามารถเลือกวันที่จะลาเป็นวันที่เกิดขึ้นก่อนวันนี้ได้!"
                                    res.render('index', {
                                        error: error_msg,
                                        old_data: req.body
                                    })
                                } else {
                                    Note.updateOne({"name":name},
                                    {total_days:(result["total_days"] + diff), $push: { "allDates": THdate_1, "ndates": req.body.fdate },$set: {"weekDates":[THdate_1],"nweekDate":[req.body.fdate], "week_days":diff}}, function(err,result){
                                        if (err){
                                            console.log(err)
                                        } else {
                                            const logEmbed = {
                                                title: name,
                                                description: `\`\`\`ini\nDate\n ⤷ ${day}\nReason\n ⤷ ${freason}\nDate Count\n ⤷ ${diff}\`\`\``,
                                                color: 0x99CCFF
                                            };
                                            const succ_msg = "ระบบบันทึกข้อมูลเรียบร้อย!"
                                            res.render('index', {
                                                success: succ_msg,
                                                old_data: req.body
                                            }).then(console.log("Success!"))
                                        
                                            axios.post(`https://discordapp.com/api/webhooks/${webhook_id}/${webhook_token}`, { "embeds": [logEmbed], "username":"log" })
                                            
                                            lineNotify.notify({
                                                message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}`,
                                            })
                                        }
                                    })
                                }
                            } else {
                                Note.updateOne({"name":name},
                                {total_days:(result["total_days"] + diff),week_days:(diff + result["week_days"]) , $push: { "allDates": THdate_1, "weekDates": THdate_1 , "ndates": req.body.fdate,"nweekDate": req.body.fdate }}, function(err, result){
                                    if (err){
                                        console.log(err)
                                    } else {
                                        const logEmbed = {
                                            title: name,
                                            description: `\`\`\`ini\nDate\n ⤷ ${day}\nReason\n ⤷ ${freason}\nDate Count\n ⤷ ${diff}\`\`\``,
                                            color: 0x99CCFF
                                        };
                                        const succ_msg = "ระบบบันทึกข้อมูลเรียบร้อย!"
                                        res.render('index', {
                                            success: succ_msg,
                                            old_data: req.body
                                        }).then(console.log("Success!"))
                                    
                                        axios.post(`https://discordapp.com/api/webhooks/${webhook_id}/${webhook_token}`, { "embeds": [logEmbed], "username":"log" })
                                        
                                        lineNotify.notify({
                                            message: `\nชื่อ: ${name}\nลาวันที่: ${day}\nเนื่องจาก: ${freason}`,
                                        })
                                    }
                                })
                            }
                        }
                        if (pass == false) {
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
    }
)


app.listen(PORT , function() {
    console.log(`Server is running on port ${PORT}`)
})