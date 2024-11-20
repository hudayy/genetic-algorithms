function createMenu() {
    let menu = createDiv();
    menu.position(0, 0);
    menu.style('width', '300px');
    menu.style('height', '100vh');
    menu.style('background-color', 'rgba(0, 0, 0, 0.7)');
    menu.style('color', 'white');
    menu.style('padding', '10px');
    menu.style('display', 'flex');
    menu.style('flex-direction', 'column');
    menu.style('align-items', 'flex-start'); // Align elements to the left

    // Mutation chance input
    createSpan('Mutation Chance:').parent(menu);
    let mutationInput = createInput(mutationChance.toString());
    mutationInput.attribute('type', 'number');
    mutationInput.parent(menu);
    mutationInput.style('display', 'block');
    mutationInput.style('margin-bottom', '10px');
    mutationInput.input(() => mutationChance = parseInt(mutationInput.value()));

    // Sim speed input
    createSpan('Simulation Speed:').parent(menu);
    let simSpeedInput = createInput(simSpeed.toString());
    simSpeedInput.attribute('type', 'number');
    simSpeedInput.parent(menu);
    simSpeedInput.style('display', 'block');
    simSpeedInput.style('margin-bottom', '10px');
    simSpeedInput.input(() => simSpeed = Math.max(1, parseInt(simSpeedInput.value())));

    // Maximum mutation angle input (in degrees)
    createSpan('Max Mutation Angle (Degrees):').parent(menu);
    let maxAngleInput = createInput('180'); // Default value: 36 degrees
    maxAngleInput.attribute('type', 'number');
    maxAngleInput.parent(menu);
    maxAngleInput.style('display', 'block');
    maxAngleInput.style('margin-bottom', '10px');
    maxAngleInput.input(() => {
        let degrees = parseInt(maxAngleInput.value());
        // Convert degrees to a fraction of 2π
        mutationMaxAngle = degrees * Math.PI / 180; // Convert degrees to radians
    });

    // Generation display
    createSpan('Generation: ').parent(menu);
    let genDisplay = createSpan('0');
    genDisplay.parent(menu);
    genDisplay.style('display', 'block');
    genDisplay.style('margin-bottom', '10px');
    function updateGenDisplay() {
        genDisplay.html(generation);
    }

    // Peak fitness display
    createSpan('Peak Fitness: ').parent(menu);
    let peakFitnessDisplay = createSpan('0');
    peakFitnessDisplay.parent(menu);
    peakFitnessDisplay.style('display', 'block');
    peakFitnessDisplay.style('margin-bottom', '10px');
    function updatePeakFitness() {
        peakFitnessDisplay.html(peakFitness);
    }

    // Updating generation and peak fitness
    function updateStats() {
        updateGenDisplay();
        updatePeakFitness();
    }

    setInterval(updateStats, 100); // Update stats every 100ms
}