require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const cron = require("node-cron")

const app = express()

app.use(express.json())
app.use(express.static("public"))

/* KẾT NỐI MONGODB */

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
  console.log("MongoDB connected")
})
.catch(err=>{
  console.log("Mongo lỗi:", err)
})

/* MODEL */

const Appointment = mongoose.model("Appointment",{
  name:String,
  phone:String,
  email:String,
  date:String,
  reminded:{type:Boolean,default:false}
})

/* EMAIL */

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
})

/* TEST MAIL (debug nhanh) */

app.get("/test-mail", async (req,res)=>{
  try{
    await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to:process.env.EMAIL_USER,
      subject:"Test mail",
      text:"Nếu thấy mail này là OK"
    })
    res.send("Gửi mail OK")
  }catch(err){
    console.log("Lỗi test mail:", err)
    res.send("Gửi mail lỗi")
  }
})

/* ĐẶT LỊCH */

app.post("/dat-lich", async (req,res)=>{

  try{

    const {name,phone,email,date} = req.body

    if(!email){
      return res.json({message:"Thiếu email"})
    }

    await Appointment.create({
      name,
      phone,
      email,
      date
    })

    res.json({message:"Đặt lịch thành công"})

  }catch(err){

    console.log(err)
    res.status(500).json({error:"Lỗi server"})

  }

})

/* XEM LỊCH */

app.get("/lich", async (req,res)=>{

  const list = await Appointment.find()

  res.json(list)

})

/* CRON */

cron.schedule("* * * * *", async ()=>{

  console.log("=== CRON RUN ===")

  const today = new Date().toLocaleDateString("en-CA")
  console.log("Today:", today)

  const list = await Appointment.find({
    date:today,
    reminded:false
  })

  console.log("List:", list)

  for(const a of list){

    if(!a.email){
      console.log("Bỏ qua vì thiếu email:", a)
      continue
    }

    try{

      await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:a.email,
        subject:"Nhắc lịch khám",
        text:`Chào ${a.name}, bạn có lịch khám hôm nay.`
      })

      a.reminded=true
      await a.save()

      console.log("ĐÃ GỬI:", a.email)

    }catch(err){

      console.log("LỖI GỬI:", err)

    }

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
  console.log("Server running")
})