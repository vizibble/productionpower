/* global echarts */
let chart_voltage = null, chart_current = null;
const data_voltage = [], data_current = [];

function resize_line_charts() {
    chart_voltage?.resize();
    chart_current?.resize();
}

function create_line_chart(domId, chartRef, title, dataRef, unit, topThreshold, bottomThreshold) {
    if (chartRef) chartRef.dispose();
    const chart = echarts.init(document.getElementById(domId));

    const option = {
        title: {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
                color: 'blue',
                fontWeight: 'bold',
                fontSize: 14
            }
        },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'time', name: 'Time' },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: `{value} ${unit}` }
        },
        dataZoom: [
            {
                type: 'inside',
                throttle: 50
            },
            {
                type: 'slider',
                bottom: 0
            }
        ],
        series: [
            {
                name: title,
                type: 'line',
                data: dataRef,
                smooth: true,
                showSymbol: false,
                markLine: {
                    data: [
                        { yAxis: topThreshold },
                        { yAxis: bottomThreshold }
                    ],
                    label: {
                        formatter: params => `Threshold: ${params.value}${unit}`
                    },
                    lineStyle: { color: 'red', type: 'dashed' }
                }
            }
        ]
    };

    window.addEventListener('resize', resize_line_charts);
    chart.setOption(option);
    return chart;
}

function update_voltage_current_data(dataset) {
    data_voltage.length = 0;
    data_current.length = 0;

    dataset.forEach(row => {
        const t = new Date(row.timestamp).getTime();
        data_voltage.push([t, row.voltage]);
        data_current.push([t, row.current]);
    });

    chart_voltage = create_line_chart('line-chart-voltage', chart_voltage, 'Voltage Over Time', data_voltage, 'V', dataset[0].max_voltage_threshold, dataset[0].min_voltage_threshold);
    chart_current = create_line_chart('line-chart-current', chart_current, 'Current Over Time', data_current, 'A', dataset[0].max_current_threshold, dataset[0].min_current_threshold);
}

function update_voltage_current_live(row) {
    const t = new Date().getTime();
    data_voltage.unshift([t, row.voltage]);
    data_current.unshift([t, row.current]);
    chart_voltage?.setOption({ series: [{ data: data_voltage }] });
    chart_current?.setOption({ series: [{ data: data_current }] });
}

module.exports = {
    update_voltage_current_data,
    update_voltage_current_live
};
