/**
 * @module utils/location
 * @description Provides functionality to check if a given location is near a target location within a defined distance.
 * 
 * @constant {Object} target_Location - The target geographical location to compare against, defined by latitude and longitude.
 * @constant {number} MAX_VARIATION_DISTANCE - The maximum allowable distance (in meters) for a location to be considered near the target location.
 * 
 * @function calculate_distance_between_two_coordinates
 * @param {Object} coord1 - The first geographical coordinate (latitude and longitude).
 * @param {Object} coord2 - The second geographical coordinate (latitude and longitude).
 * @returns {number} - The distance between the two coordinates in meters.
 * 
 * @description
 * This function calculates the great-circle distance between two geographical points using the Haversine formula.
 * It is used internally to determine how far apart the current location is from the target location.
 * 
 * @function is_point_near_target_location
 * @param {Object} currentLocation - The current geographical location (latitude and longitude) to check.
 * @returns {boolean} - Returns `true` if the current location is within the maximum variation distance from the target location, `false` otherwise.
 * 
 * @description
 * This function checks if a given geographical location (current location) is within the allowed variation distance
 * (defined by `MAX_VARIATION_DISTANCE`) from the target location.
 * It calls `calculate_distance_between_two_coordinates` to compute the distance and returns a boolean indicating whether the location is near.
 * 
 * @example
 * // Example usage:
 * const isNear = is_point_near_target_location({ latitude: 30.886190, longitude: 75.929030 });
 * console.log(isNear); // Outputs: true or false depending on proximity.
 * 
 * @throws {Error} No specific errors are thrown, but ensure valid latitude and longitude values are passed to the functions.
 */
const target_Location = { latitude: 30.886188, longitude: 75.929028 };
const MAX_VARIATION_DISTANCE = 100; // in meters

function calculate_distance_between_two_coordinates(coord1, coord2) {
    const toRad = (x) => (x * Math.PI) / 180;

    const R = 6371e3; // Radius of Earth in meters
    const φ1 = toRad(coord1.latitude);
    const φ2 = toRad(coord2.latitude);
    const Δφ = toRad(coord2.latitude - coord1.latitude);
    const Δλ = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // distance in meters
    return distance;
}

function is_point_near_target_location(currentLocation) {
    const distance = calculate_distance_between_two_coordinates(currentLocation, target_Location);
    return distance <= MAX_VARIATION_DISTANCE;
}

module.exports = {is_point_near_target_location};
