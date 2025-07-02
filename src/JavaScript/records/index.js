/* global agGrid */
const selectButton = document.querySelector("#select");

const formatDate = (dateString) => {
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

let formattedRecords = [];
let gridApi;
const gridOptions = {
    columnDefs: [
        { field: "Machine", filter: true, floatingFilter: true },
        { field: "Alert Type", filter: true, floatingFilter: true },
        { field: "Measured Value", filter: true, floatingFilter: true },
        { field: "Threshold Value", filter: true, floatingFilter: true },
        { field: "Timestamp", flex: 2, filter: true, floatingFilter: true, minWidth: 250 }
    ],
    defaultColDef: {
        resizable: true,
        minWidth: 100,
        flex: 1
    },
    rowData: [],
    onGridReady: (params) => (gridApi = params.api)
};

agGrid.createGrid(document.querySelector("#myGrid"), gridOptions);

window.addEventListener("resize", () => {
    if (gridApi) gridApi.sizeColumnsToFit();
});

selectButton.addEventListener("click", async () => {
    gridApi.applyTransaction({ remove: formattedRecords });
    await fetchData();
});

const fetchData = async () => {
    const selectedDevice = document.querySelector('input[name="device"]:checked').value;
    document.querySelector("#myGrid").classList.remove("hidden");

    try {
        const response = await fetch(`/records/data?device=${selectedDevice}`);
        const records = await response.json();

        if (!records.length) return;

        formattedRecords = records.map(record => ({
            "Machine": record.machine_name,
            "Alert Type": record.type.replace("_", " ").toUpperCase(),
            "Measured Value": record.measured_value,
            "Threshold Value": record.threshold_value,
            "Timestamp": formatDate(record.timestamp)
        }));

        gridApi.applyTransaction({ add: formattedRecords });
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Error fetching records:`, error);
        alert("Failed to fetch alert records.");
    }
};