require("dotenv").config();
const express = require('express');
const app = express();
app.use(express.json());
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const user = require('./models/user');
const SavedFiles = require('./models/SavedFiles');
const SavedForm=require('./models/SaveForm');
const ConfirmForm=require('./models/ConfirmForm');
require("./db");
const jwt=require('jsonwebtoken');
const checkAuth=require('./checkAuth')
// const db = "mongodb+srv://navneet:navneet123@cluster0.srpvfu9.mongodb.net/?retryWrites=true&w=majority"; 
const port =process.env.PORT || 8000;
app.post("/",(req,res)=>{
    const {email,password}=req.body;
    // console.log(password);
    user.find({ email: email})
        .then((exist) => { 
            //  console.log(exist)
            const pass=exist[0].password 
            bcrypt.compare(password, pass).then(function(result) {
                if(result){
                    const accesstoken=jwt.sign({
                       _id:exist[0]._id
                      },"random",
                      {
                        expiresIn:"5h"
                      }
                      
                      )
                    return res.status(200).json({
                        message:"Successfully logged in",
                        token:accesstoken,
                        exist
                    })

                }
                else{
                    return res.json({ message: "User Does Not Exist" });
                }
            });
        })
})
app.post("/changePassword",async(req, res)=>{
    const { currentPassword, newPassword, email } = req.body;
    console.log("hello");
    try {
        const user_data = await user.findOne({ email: email });
           console.log(user_data)
        
    
        // Check if the user exists
        if (!user_data) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user_data.password);
        // console.log(isPasswordCorrect)
    
        if (!isPasswordCorrect) {
          return res.status(401).json({ error: 'Invalid current password' });
        }
    
        const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(newPassword,salt);
        
        user_data.password = secPass;
        await user_data.save();
    

        res.json({ message: 'Password changed successfully' });
      } catch (error) {

        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }



})
app.post("/saveConfirmFile",checkAuth,(req,res)=>{
    const {url,email}=req.body;
    const data = new ConfirmForm({
        email: email,
        url: url
    });
    data.save();
    return res.json({ message: "Success" });
})
app.get("/findUsers",(req,res)=>{
    user.find({})
        .then((exist) => {
            if (exist) {
                return res.json({exist });
            }
            else {
                return res.json({ message: "User Does Not Exist" });
            }
        })
})
app.post("/getSavedFiles",(req,res)=>{
    const {email}=req.body;
    SavedFiles.find({ email: email})
        .then((exist) => {
            if (exist) {
                return res.json({exist });
            }
            else {
                return res.json({ message: "User Does Not Exist" });
            }
        })
})
app.post("/saveFile",checkAuth,(req,res)=>{
    const {email,item,check}=req.body;
    const data = new SavedFiles({
        email: email,
        name: item,
        firebase:check
    });
    data.save();
    return res.json({ message: "Success" });
})
app.post('/saveUser', checkAuth,async function (req, res) {
    try {  
        const {email,name,role,}=req.body;
    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt);
    console.log(secPass);
    const data = new user({
        email: email,
        name: name,
        Role:role,
        password:secPass
    });
    data.save();
    return res.json({ message: "Success" });
    } catch (e) {
      res.end(e.message || e.toString());
    }
  });
app.post("/saveRole",checkAuth,(req,res)=>{
    const {email,role}=req.body;
    user.findOneAndUpdate(
        { "email": email },
        { "$set": { "Role": role } },
        { "new": true, "upsert": true },
        function (err) {
            if (err) { // err: any errors that occurred
                console.log(err);
            }
        })
    return res.json({ message: "Success" });
})
app.post("/approve",checkAuth,(req,res)=>{
    const {name}=req.body;
    SavedForm.findOneAndUpdate(
        { "name": name },
        { "$set": { "Approve": true } },
        { "new": true, "upsert": true },
        function (err) {
            if (err) { // err: any errors that occurred
                console.log(err);
            }
        })
    return res.json({ message: "Success" });
})
app.post("/markAsImportant",checkAuth,(req,res)=>{
    const {name}=req.body;
    SavedForm.findOneAndUpdate(
        { "name": name },
        { "$set": { "important": true } },
        { "new": true, "upsert": true },
        function (err) {
            if (err) { // err: any errors that occurred
                console.log(err);
            }
        })
    return res.json({ message: "Success" });
})
app.post("/saveForm",checkAuth,(req,res)=>{
    const {name,age,gender,address,earAnomalies,noseAnomalies,throatAnomalies,rightEarValue,leftEarValue,Hz500,Hz1000,Hz2000,Hz5000,
        treatmentRecommended,ThroatCovid,NoseCovid,ThroatInfectionDetected,NoseInfectionDetected,InfectionDescriptionNose,InfectionDescriptionThroat}=req.body;
        const data = new SavedForm({
            name:name,
            age:age,
            gender:gender,
            address:address,
            earAnomalies:earAnomalies,
            noseAnomalies:noseAnomalies,
            throatAnomalies:throatAnomalies,
            rightEarValue:rightEarValue,
            leftEarValue:leftEarValue,
            Hz500:Hz500,
            Hz1000:Hz1000,
            Hz2000:Hz2000,
            Hz5000:Hz5000,
            treatmentRecommended:treatmentRecommended,
            ThroatCovid:ThroatCovid,
            NoseCovid:NoseCovid,
            ThroatInfectionDetected:ThroatInfectionDetected,
            NoseInfectionDetected:NoseInfectionDetected,
            InfectionDescriptionNose:InfectionDescriptionNose,
            InfectionDescriptionThroat:InfectionDescriptionThroat
        });
        data.save();
        return res.json({ message: "Success" });
})
app.post("/addComment",(req,res)=>{
    const {comment,id}=req.body;
    console.log(comment,id);
    SavedForm.findOneAndUpdate(
        { "_id": id },
        { "$set": { "comment": comment } },
        { "new": true, "upsert": true },
        function (err) {
            if (err) { // err: any errors that occurred
                console.log(err);
            }
        })
        return res.json({ message: "Success" });
})
app.post("/findFile",(req,res)=>{
    const {item}=req.body;
    console.log(item);
    SavedForm.find({"_id":item})
        .then((exist) => {
            if (exist) {
                return res.json({exist });
            }
            else {
                return res.json({ message: "User Does Not Exist" });
            }
        })
})
app.post("/getForms",(req,res)=>{
    SavedForm.find({})
        .then((exist) => {
            if (exist) {
                return res.json({exist });
            }
            else {
                return res.json({ message: "User Does Not Exist" });
            }
        })
})
app.post("/getReqForm",(req,res)=>{
    const {name}=req.body;
    SavedForm.find({name:name})
        .then((exist) => {
            if (exist) {
                return res.json({exist });
            }
            else {
                return res.json({ message: "User Does Not Exist" });
            }
        })
})

app.get("/",(req,res)=>{
    return res.json(({message:"hello"}))
})

// server=app.listen(port, () => {
//     console.log(`server at port ${port}` );
// });
// mongoose.connect(db, ()=>{
//     console.log("connected");
// })