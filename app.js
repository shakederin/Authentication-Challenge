const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const router = express.Router();
const SECRET = "G#AKkaja6JALK87LJ8kla8KJ^j654*"
const {USERS, INFORMATION, REFRESHTOKENS} =  require("./Database/allData");


router.post("/users/register", async (req, res)=>{
    const newUserInfo = req.body;
    // check if user exist
    for(let user in USERS){
        if(USERS[user].name === newUserInfo.user || USERS[user].email === newUserInfo.email){
            res.status(409).send("user already exists")
            return;
        }   
    }
    //make the obj on the same format 
    newUserInfo.isAdmin = false;
    newUserInfo.name = newUserInfo.user;
    delete newUserInfo.user
    
    // save the INFO about the new user
    INFORMATION.push({"email":newUserInfo.email, "info":`${newUserInfo.name} info`})
    
    //hash the password
    const hash = await bcrypt.hash(newUserInfo.password, 10);
    newUserInfo.password = hash;
    USERS.push(newUserInfo);
    res.status(201).send("Register Success")
})

router.post("/users/login", async (req,res)=>{
    const loginInfo = req.body;   
    for(let user in USERS){
        if(USERS[user].email === loginInfo.email){
            const match = await bcrypt.compare(loginInfo.password, USERS[user].password);
            if(!match){
                res.status(403).send("User or Password incorrect")
                return;
            }
            const token = createToken((loginInfo), SECRET,  500000);
            const refreshToken = createToken((loginInfo), SECRET);
            REFRESHTOKENS.push(refreshToken);
            res.status(200).json({
                token:token,
                refreshToken:refreshToken,
                email:loginInfo.email,
                name:USERS[user].name,
                isAdmin:USERS[user].isAdmin
                });
            return;
        }else{
            if(user == USERS.length-1){
                res.status(403).send("User or Password incorrect")
                return;
            }
        }
    }   
})

router.post("/users/tokenValidate", (req,res)=>{
    const accessToken = req.headers.authorization.substr(7,req.headers.authorization.length-1);
    if(!accessToken){
        res.status(401).send("Access Token Required")
        return;
    }
    jwt.verify(accessToken, SECRET, (err, user)=>{
        if(err){
            console.log(err);
            res.status(403).send("Invalid Access Token")
            return;
        }
    })
    res.send({valid: true})
} )

router.get("/api/v1/information", (req,res)=>{
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
})

router.post("/users/token", (req,res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken){
        res.status(401).send("Refresh Token Required");
        return;
    }
    let userInfo = {};
    jwt.verify(refreshToken, SECRET , (err, user)=>{
        if(err){
            res.status(403).send("Invalid Refresh Token");
            return;
        }
        userInfo = user ;
    })
    const token = createToken((userInfo), SECRET, 5000)
    res.status(200).json({accessToken:token})
})

router.post("/users/logout", (req,res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken){
        res.status(400).send("Refresh Token Required");
        return;
    }
    if(!REFRESHTOKENS.includes(refreshToken)){
        res.status(400).send("Invalid Refresh Token");
        return;
    }
    REFRESHTOKENS.delete(refreshToken);
    res.send("User Logged Out Successfully")
})

router.get("/api/v1/users", (req,res)=>{
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
})

router.options("/", (req,res)=>{
    const token = req.headers.authorization.substr(7,req.headers.authorization.length-1);
    if(!token){
        res.status(200).set({Allow: "OPTIONS, GET, POST"}).json(options.splice(0,2))
        return;
    }
    jwt.verify(token, SECRET, (err,user)=>{
        if(err){
            res.status(200).set({Allow: "OPTIONS, GET, POST"}).json(options.splice(0,3))
            return;
        }
        const userEmail = user.email;
        for(let user of USERS){
            if(user.email === userEmail){
                if(user.isAdmin){
                    res.status(200).set({Allow: "OPTIONS, GET, POST"}).json(options)
                    return;
                }
            }
        }
    })
    res.status(200).set({Allow: "OPTIONS, GET, POST"}).json(options.splice(0,5))

})


const options =[
    { method: "post", path: "/users/register", description: "Register, Required: email, name, password", example: { body: { email: "user@email.com", name: "user", password: "password" } } },
    { method: "post", path: "/users/login", description: "Login, Required: valid email and password", example: { body: { email: "user@email.com", password: "password" } } },
    { method: "post", path: "/users/token", description: "Renew access token, Required: valid refresh token", example: { headers: { token: "\*Refresh Token\*" } } },
    { method: "post", path: "/users/tokenValidate", description: "Access Token Validation, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "get", path: "/api/v1/information", description: "Access user's information, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "post", path: "/users/logout", description: "Logout, Required: access token", example: { body: { token: "\*Refresh Token\*" } } },
    { method: "get", path: "api/v1/users", description: "Get users DB, Required: Valid access token of admin user", example: { headers: { authorization: "Bearer \*Access Token\*" } } }
  ]
module.exports = router;