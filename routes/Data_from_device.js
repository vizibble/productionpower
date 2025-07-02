const express = require("express")
const router = express.Router()

const { handleDataFromDevice } = require("../controllers/Data_from_device")

router.route("/data/:id")
    .post(handleDataFromDevice)

module.exports = router