const axios = require('axios');

// main.js
const select_Button = document.getElementById("select");
const loading_Button = document.getElementById("loading");
let selectedMachine = "";

const { update_voltage_current_data, update_voltage_current_live } = require("./graph.js");
const { update_gauges, create_gauges } = require("./gauge.js");
const { show_popup } = require("./popup.js");

/* global io */
const socket = io.connect();

function initializeDeviceSelection() {
    select_Button.addEventListener("click", async () => {
        const selectedDevice = document.querySelector('input[name="device"]:checked');
        if (!selectedDevice) {
            alert("Please select a machine.");
            return;
        }

        selectedMachine = selectedDevice.value;

        select_Button.disabled = true;
        select_Button.style.display = "none";
        loading_Button.style.display = "inline-flex";

        try {
            const range = document.querySelector('input[name="range"]:checked').value;

            const response = await axios.get(`/widgets/data`, {
                params: {
                    deviceId: selectedMachine,
                    range: range
                }
            });

            const { data } = response.data;
            if (!Array.isArray(data) || data.length === 0) throw new Error("No data returned");

            document.querySelector('.widgets').classList.remove('hidden');

            update_voltage_current_data(data);
            create_gauges({ voltage: data[0].voltage, current: data[0].current });
        } catch (error) {
            console.error("Error fetching device data:", error);
            show_popup("Error fetching device data");
        } finally {
            select_Button.disabled = false;
            select_Button.style.display = "flex";
            loading_Button.style.display = "none";
        }
    });

    // Listen for real-time telemetry updates
    socket.on("device_data", ({ device_id, voltage, current }) => {
        if (device_id === selectedMachine) {
            update_voltage_current_live({ voltage, current });
            update_gauges({ voltage, current });
        }
    });
}

initializeDeviceSelection();