const express = require("express")
const mongoose = require("mongoose")

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
    date:String
})

/* API ĐẶT LỊCH */

app.post("/dat-lich", async (req,res)=>{

    const {name, phone, date} = req.body

    await Appointment.create({
        name,
        phone,
        date
    })

    res.json({
        message:"Đặt lịch thành công"
    })

})

/* API LẤY DANH SÁCH LỊCH */

app.get("/lich", async (req,res)=>{

    const list = await Appointment.find()

    res.json(list)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log("Server running")
})