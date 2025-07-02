function calculateVolume(equation, height) {
    let volume = 0;
    for (let degree in equation) {
        const coefficient = equation[degree];
        volume += coefficient * Math.pow(Number(height), Number(degree));
    }
    return volume;
}

module.exports = { calculateVolume };