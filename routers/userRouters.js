const express = require("express");
const router = express.Router();
import {signUp, signIn, isTokenIsValide, getNewToken, logOut} from "../controllers/users"

router.post("/users/register", signUp)

router.post("/users/login", signIn)

router.post("/users/tokenValidate", isTokenIsValide)

router.post("/users/token", getNewToken)

router.post("/users/logout", logOut)

module.exports = router;