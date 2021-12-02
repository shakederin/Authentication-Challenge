const bcrypt = require("bcrypt");
const jwt = require ('jsonwebtoken');
const SECRET = "G#AKkaja6JALK87LJ8kla8KJ^j654*"
const { USERS, INFORMATION, REFRESHTOKENS } = require("../Database/allData");

exports.signUp = async (req, res)=>{
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
}

exports.signIn = async (req,res)=>{
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
}

exports.isTokenIsValide =(req,res)=>{
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
}

exports.getUserInfo = (req,res)=>{
    const accessToken = req.headers.authorization.substr(7, req.headers.authorization.length-1);
    if(!accessToken){
        res.status(401).send("Access Token Required"); 
    }
    verify(accessToken, SECRET, (err, user)=>{
        if(err){
            console.log(err);
            res.status(403).send("Invalid Access Token");
        }
        res.send(user)
    })
}

exports.getNewToken = (req,res)=>{
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
}

exports.logOut = (req,res)=>{
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
}


function createToken(data, secret, exprire){
    if(exprire){
        return jwt.sign(data, secret, {expiresIn : exprire})
    }
    return jwt.sign(data, secret)
}