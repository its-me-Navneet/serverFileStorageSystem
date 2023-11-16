const mongoose = require("mongoose");

const DB ="mongodb+srv://navneet:navneet123@cluster0.srpvfu9.mongodb.net/?retryWrites=true&w=majority"; 


mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=> console.log("DataBase Connected")).catch((err)=>{
    console.log(err);
})