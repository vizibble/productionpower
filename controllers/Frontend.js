require("dotenv").config()
const { JWTGeneration } = require("../service/userAutehntication.js")
const { Get_All_Ids_Query, Get_Device_Info_Query, Update_Device_Info_Query, Get_Widget_Data_Query, Get_Records_Query } = require("../Database/Frontend.js");

const displayGraph = async (req, res) => {
    try {
        const machines = await Get_All_Ids_Query();
        return res.status(200).render("index.ejs", { names: machines });
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching machines: ${error.message}`);
        return res.status(500).json({ error: "Internal server error while fetching machines." });
    }
};

const GetWidgetData = async (req, res) => {
    const { range, deviceId } = req.query;
    try {
        const rows = await Get_Widget_Data_Query(range, deviceId);
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for device ${deviceId}: ${error.message}`);
        return res.status(500).json({ error: "Internal server error while retrieving data." });
    }
};

const displayLogin = (req, res) => {
    return res.render("login")
};

const validateUser = (req, res) => {
    const options = {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
    }
    const { email, password } = req.body
    if (email !== process.env.EMAIL || password !== process.env.PASSWORD) return res.redirect("/login")
    const payload = { email, password }
    const token = JWTGeneration(payload)
    res.cookie("token", token, options)
    return res.redirect('/admin')
};

const displayPanel = async (req, res) => {
    try {
        const { rows } = await Get_Device_Info_Query();
        return res.render("admin", { configs: rows })
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error geting data for admin panel: ${err.message}`)
        return res.status(500).json({ error: "Internal server error while fetching data for admin panel." })
    }
};

const updateMetaData = async (req, res) => {
    const { machine_name, product, operator_name, min_voltage, max_voltage, min_current, max_current, device_id } = req.body;
    try {
        await Update_Device_Info_Query({ machine_name, product, operator_name, min_voltage, max_voltage, min_current, max_current, device_id });
        return res.status(201).json({ message: "Device data updated successfully" });
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating data: ${err.message}`);
        return res.status(500).json({ error: "Internal server error while updating." })
    }
};

const displayRecords = async (req, res) => {
    try {
        const rows = await Get_All_Ids_Query();
        return res.render("records", { names: rows });
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error geting records for history: ${err.message}.`)
        return res.status(500).json({ error: "Internal server error while fetching records." })
    }
}

const getRecords = async (req, res) => {
    const { device = 'all'} = req.query;

    try {
        const rows = await Get_Records_Query( device);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving records based on query: ${error.message}`);
        return res.status(500).json({ error: "Internal server error while retrieving records based on query." });
    }
}

module.exports = { displayGraph, displayLogin, displayPanel, validateUser, updateMetaData, GetWidgetData, displayRecords, getRecords };