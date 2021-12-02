const express = require("express");
const router = express.Router();
import {getUserInfo, getAllUsers} from "../controllers/api";

router.get("/api/v1/information", getUserInfo);

router.get("/api/v1/users", getAllUsers);

module.exports = router;