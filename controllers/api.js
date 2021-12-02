const jwt = require('jsonwebtoken')
const USERS = require("../Database/allData")
const SECRET = "G#AKkaja6JALK87LJ8kla8KJ^j654*"

exports.getAllUsers = (req,res)=>{
    const token = req.headers.authorization.substr(7,req.headers.authorization.length-1);
    if(!token){
        res.status(401).send("Access Token Required")
        return;
    }
    jwt.verify(token, SECRET, (err,user)=>{
        if(err){
            res.status(403).send("Invalid Access Token")
            return;
        }
        const userEmail = user.email;
        for(let user of USERS){
            if(user.email === userEmail){
                if(user.isAdmin){
                    res.status(200).json({USERS:USERS})
                    return;
                }
            }
        }
    })
    res.status(403).send("Invalid Access Token");
    return;
}

exports.getUserInfo = (req,res)=>{
    const accessToken = req.headers.authorization.substr(7, req.headers.authorization.length-1);
    if(!accessToken){
        res.status(401).send("Access Token Required"); 
    }
    jwt.verify(accessToken, SECRET, (err, user)=>{
        if(err){
            console.log(err);
            res.status(403).send("Invalid Access Token");
        }
        res.send(user)
    })
}
