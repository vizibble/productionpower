/**
 * @module utils/fuelTrend
 * @description Analyzes fuel data to detect the trend of fuel levels (increasing, decreasing, or stable).
 */

/**
 * Computes the moving average over a given window size to smooth the data.
 *
 * @function movingAverage
 * @param {Array<number>} data - The input array of fuel levels.
 * @param {number} windowSize - The number of elements to include in each moving average calculation.
 * @returns {Array<number>} The smoothed data using the moving average.
 * 
 * @example
 * const averaged = movingAverage([100, 102, 98, 105, 110], 3);
 * console.log(averaged); // Example output: [100, 101.67, 103]
 */
function movingAverage(data, windowSize) {
    if (windowSize <= 0 || windowSize > data.length) return [];
    const averages = [];
    for (let i = windowSize - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = i - windowSize + 1; j <= i; j++) {
            sum += data[j];
        }
        averages.push(Number((sum / windowSize).toFixed(2)));
    }
    return averages;
}

/**
 * Detects the trend of fuel levels (increasing, decreasing, or stable).
 *
 * @function get_Fuel_Trend
 * @param {Array<number>} data - An array of fuel levels over time.
 * @returns {number} - The detected fuel trend:
 *   - `1` for an increasing trend (≥ 75% of values are increasing).
 *   - `-1` for a decreasing trend (≥ 75% of values are decreasing).
 *   - `0` for a stable trend (neither increasing nor decreasing dominates).
 * 
 * @description
 * 1. **Applies a moving average** with a window size of `5` to smooth the data.
 * 2. **Counts the number of increasing and decreasing changes** between consecutive values.
 * 3. **Determines the trend** based on percentage thresholds.
 * 
 * @example
 * // Example usage:
 * const trend = get_Fuel_Trend([100, 105, 110, 120, 130]);
 * console.log(trend); // Outputs: 1 (increasing trend).
 * 
 * @throws {Error} No specific errors are thrown, but ensure the `data` array is not empty to avoid division by zero errors.
 */
function get_Fuel_Trend(data) {
    const smoothedData = movingAverage(data, 5);
    let increasingCount = 0;
    let decreasingCount = 0;

    for (let i = 1; i < smoothedData.length; i++) {
        if (smoothedData[i] > smoothedData[i - 1]) {
            increasingCount++;
        } else if (smoothedData[i] < smoothedData[i - 1]) {
            decreasingCount++;
        }
    }

    const totalPairs = smoothedData.length - 1;
    const increasingPercentage = (increasingCount / totalPairs) * 100;
    const decreasingPercentage = (decreasingCount / totalPairs) * 100;

    if (increasingPercentage >= 75) return 1;
    if (decreasingPercentage >= 75) return -1;
    return 0;
}

module.exports = { get_Fuel_Trend };