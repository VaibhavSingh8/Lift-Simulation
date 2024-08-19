const liftDataStore = {
  floors: 0,
  lifts: 0,
};

const simulateBtn = document.querySelector(".input-btn");
const simulationContainer = document.getElementById("simulation-container");
const floors = document.querySelector("#floors");
const lifts = document.querySelector("#lifts");

simulateBtn.addEventListener("click", () => {
  const numberOfFloors = parseInt(floors.value);
  const numberOfLifts = parseInt(lifts.value);

  simulationContainer.innerHTML = "";

  const floorsContainer = document.createElement("div");
  floorsContainer.classList.add("floors-container");

  for (let i = numberOfFloors; i > 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floors-div");
    floorDiv.textContent = `Floor ${i}`;

    floorsContainer.appendChild(floorDiv);
  }

  const liftsContainer = document.createElement("div");
  liftsContainer.classList.add("lifts-container");

  for (let i = 1; i <= numberOfLifts; i++) {
    const liftDiv = document.createElement("div");
    liftDiv.classList.add("lift-div");

    liftsContainer.appendChild(liftDiv);
  }
  // adding floors and lifts to simulation-container section
  simulationContainer.appendChild(floorsContainer);
  simulationContainer.appendChild(liftsContainer);
});
