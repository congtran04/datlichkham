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
  console.log(err)
})

/* MODEL LỊCH KHÁM */

const Appointment = mongoose.model("Appointment",{
  name:String,
  phone:String,
  email:String,
  date:String,
  reminded:{type:Boolean,default:false}
})

/* CẤU HÌNH EMAIL */

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
})

/* API ĐẶT LỊCH */

app.post("/dat-lich", async (req,res)=>{

  try{

    const {name,phone,email,date} = req.body

    await Appointment.create({
      name,
      phone,
      email,
      date
    })

    res.json({message:"Đặt lịch thành công"})

  }catch(err){

    res.status(500).json({error:"Lỗi server"})

  }

})

/* API XEM LỊCH */

app.get("/lich", async (req,res)=>{

  const list = await Appointment.find()

  res.json(list)

})

/* CRON JOB KIỂM TRA LỊCH */

cron.schedule("0 * * * *", async ()=>{

  const today = new Date().toISOString().split("T")[0]

  const list = await Appointment.find({
    date:today,
    reminded:false
  })

  for(const a of list){

    try{

      await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:a.email,
        subject:"Nhắc lịch khám",
        text:`Chào ${a.name}, bạn có lịch khám hôm nay.`
      })

      a.reminded=true
      await a.save()

      console.log("Đã gửi email cho",a.email)

    }catch(err){

      console.log("Lỗi gửi email",err)

    }

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
  console.log("Server running")
})