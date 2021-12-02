const express = require("express");
const router = express.Router();
const {signUp, signIn, isTokenIsValide, getNewToken, logOut} = require("../controllers/users");

router.post("/register", signUp)

router.post("/login", signIn)

router.post("/tokenValidate", isTokenIsValide)

router.post("/token", getNewToken)

router.post("/logout", logOut)

module.exports = router;