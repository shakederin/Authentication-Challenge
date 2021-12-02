const jwt = require('jsonwebtoken')
const SECRET = "G#AKkaja6JALK87LJ8kla8KJ^j654*"

export function returnOptions (req,res){
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
}

const options =[
    { method: "post", path: "/users/register", description: "Register, Required: email, name, password", example: { body: { email: "user@email.com", name: "user", password: "password" } } },
    { method: "post", path: "/users/login", description: "Login, Required: valid email and password", example: { body: { email: "user@email.com", password: "password" } } },
    { method: "post", path: "/users/token", description: "Renew access token, Required: valid refresh token", example: { headers: { token: "\*Refresh Token\*" } } },
    { method: "post", path: "/users/tokenValidate", description: "Access Token Validation, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "get", path: "/api/v1/information", description: "Access user's information, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "post", path: "/users/logout", description: "Logout, Required: access token", example: { body: { token: "\*Refresh Token\*" } } },
    { method: "get", path: "api/v1/users", description: "Get users DB, Required: Valid access token of admin user", example: { headers: { authorization: "Bearer \*Access Token\*" } } }
]