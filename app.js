const express = require('express')
const router = express.Router()
const userRouters = require("./routers/userRouters")
const apiRouters = require("./routers/apiRouters")
const {returnOptions} = require("./controllers/options");

router.use("/users", userRouters)
router.use("/api", apiRouters)
router.options("/", returnOptions)

module.exports = router