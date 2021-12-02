const express = require("express");
const router = express.Router();
const {getUserInfo, getAllUsers} = require ("../controllers/api");

router.get("/v1/information", getUserInfo);

router.get("/v1/users", getAllUsers);

module.exports = router;