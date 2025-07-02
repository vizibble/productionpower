/* global echarts */
let gauge_voltage = null;
let gauge_current = null;

function create_gauge_generic(domId, value, label, max) {
    const chart = echarts.init(document.getElementById(domId));
    const option = {
        tooltip: { formatter: '{a} <br/>{b} : {c}' },
        series: [{
            name: label,
            type: 'gauge',
            min: 0,
            max: max,
            progress: { show: true },
            detail: { valueAnimation: true, formatter: `{value} ${label}` },
            data: [{ value, name: label }]
        }]
    };
    chart.setOption(option);
    return chart;
}

function create_gauges({ voltage, current }) {
    gauge_voltage = create_gauge_generic('gauge-voltage', voltage, 'Voltage', 300);
    gauge_current = create_gauge_generic('gauge-current', current, 'Current', 30);
}

function update_gauges({ voltage, current }) {
    gauge_voltage?.setOption({ series: [{ data: [{ value: voltage, name: 'Voltage' }] }] });
    gauge_current?.setOption({ series: [{ data: [{ value: current, name: 'Current' }] }] });
}

module.exports = { create_gauges, update_gauges };