// admin-panel/index.js (updated for welding device editing)

// Store original values before editing
const originalValues = new Map();

// Extract current values from a table row
function getCurrentValues(row) {
    return {
        machine_name: row.querySelector('input[name="machine_name"]').value,
        product: row.querySelector('input[name="product"]').value,
        operator_name: row.querySelector('input[name="operator"]').value,
        min_voltage: row.querySelector('input[name="min_voltage"]').value,
        max_voltage: row.querySelector('input[name="max_voltage"]').value,
        min_current: row.querySelector('input[name="min_current"]').value,
        max_current: row.querySelector('input[name="max_current"]').value
    };
}

// Get row + primary ID
function getRowData(button) {
    const row = button.closest('tr');
    return {
        row,
        deviceId: row.dataset.deviceId,
        inputs: row.querySelectorAll('input')
    };
}

// Compare old vs new values
function hasChanges(original, current) {
    return Object.keys(original).some(key => original[key] !== current[key]);
}

// Send PATCH update to server
async function updateServer(deviceId, currentValues) {
    try {
        const response = await fetch('/admin', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_id: deviceId, ...currentValues })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error('Update failed:', error);
        return false;
    }
    return true;
}

// Revert on failure
function revertValues(row, deviceId) {
    const original = originalValues.get(deviceId);
    row.querySelector('input[name="machine_name"]').value = original.machine_name;
    row.querySelector('input[name="product"]').value = original.product;
    row.querySelector('input[name="operator"]').value = original.operator_name;
    row.querySelector('input[name="min_voltage"]').value = original.min_voltage;
    row.querySelector('input[name="max_voltage"]').value = original.max_voltage;
    row.querySelector('input[name="min_current"]').value = original.min_current;
    row.querySelector('input[name="max_current"]').value = original.max_current;
    alert('Failed to save changes. Reverting to original values.');
}

// Main edit handler
async function handleEditClick(event) {
    const { row, deviceId, inputs } = getRowData(event.target);
    const button = event.target;
    const isEditing = button.textContent.trim() === "Edit";
    button.textContent = isEditing ? "Done" : "Edit";
    inputs.forEach(input => input.disabled = !isEditing);

    if (isEditing) return;
    const currentValues = getCurrentValues(row);

    if (!hasChanges(originalValues.get(deviceId), currentValues)) return;

    const success = await updateServer(deviceId, currentValues);
    if (!success) revertValues(row, deviceId);
    else originalValues.set(deviceId, currentValues);
}

// Initial load to store values
window.addEventListener("DOMContentLoaded", () => {
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const deviceId = row.dataset.deviceId;
        originalValues.set(deviceId, getCurrentValues(row));
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });
});