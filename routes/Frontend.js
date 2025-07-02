const express = require("express");
const router = express.Router();
const { JWTMiddleware } = require("../middleware/checkAuth.js");
const { displayGraph, displayLogin, displayPanel, validateUser, updateMetaData, GetWidgetData, displayRecords, getRecords } = require("../controllers/Frontend.js");

router.route("/")
    .get(displayGraph);

router.route("/widgets/data")
    .get(GetWidgetData);

router.route("/login")
    .get(displayLogin)
    .post(validateUser);

router.route("/admin")
    .get(JWTMiddleware, displayPanel)
    .patch(updateMetaData);

router.route("/records")
    .get(displayRecords);

router.route("/records/data")
    .get(getRecords);

module.exports = router;