const express = require("express")
const app = express()

app.use(express.json())
app.use(express.static("public"))

let appointments = []

app.post("/dat-lich", (req,res)=>{

    const {name, phone, date} = req.body

    appointments.push({
        name,
        phone,
        date
    })

    res.json({
        message:"Đặt lịch thành công"
    })

})

app.get("/lich", (req,res)=>{
    res.json(appointments)
})

app.listen(3000,()=>{
    console.log("Server chạy tại http://localhost:3000")
})