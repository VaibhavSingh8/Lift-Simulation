const liftDataStore = {
  floors: 0,
  lifts: 0,
};

let lifts = [];
let liftRequestQueue = [];

const simulateBtn = document.querySelector(".input-btn");
const simulationContainer = document.getElementById("simulation-container");

function getFloorLabel(floorNumber) {
  if (floorNumber > 0) {
    return `Floor ${floorNumber}`;
  } else if (floorNumber < 0) {
    return `Basement ${Math.abs(floorNumber)}`;
  } else {
    return `Ground Floor`;
  }
}

function initializeSimulation(numberOfFloors, numberOfLifts) {
  simulationContainer.innerHTML = "";
  lifts = [];
  liftRequestQueue = [];

  const lowestFloor = Math.min(0, numberOfFloors);
  const highestFloor = Math.max(0, numberOfFloors);
  const totalFloors = Math.abs(highestFloor) + Math.abs(lowestFloor) + 1;

  // Create floors
  for (let i = highestFloor; i >= lowestFloor; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");

    const controlBtnWrapper = document.createElement("div");
    controlBtnWrapper.classList.add("control-btn-wrapper");

    if (i < highestFloor) {
      const upButton = document.createElement("button");
      upButton.classList.add("control-button");
      upButton.textContent = "UP";
      upButton.addEventListener("click", () => requestLift(i, "up"));
      controlBtnWrapper.appendChild(upButton);
    }

    if (i > lowestFloor) {
      const downButton = document.createElement("button");
      downButton.classList.add("control-button");
      downButton.textContent = "DOWN";
      downButton.addEventListener("click", () => {
        console.log(i);
        requestLift(i, "down");
      });
      controlBtnWrapper.appendChild(downButton);
    }

    floorDiv.appendChild(controlBtnWrapper);

    const floorNumber = document.createElement("div");
    floorNumber.classList.add("floor-number");
    floorNumber.textContent = getFloorLabel(i);
    floorDiv.appendChild(floorNumber);

    simulationContainer.appendChild(floorDiv);
  }

  // Create lifts
  const liftContainer = document.createElement("div");
  liftContainer.classList.add("lift-container");

  const floorHeight = 100;
  const totalHeight = floorHeight * totalFloors;
  liftContainer.style.height = `${totalHeight}px`;

  for (let i = 1; i <= numberOfLifts; i++) {
    const liftDiv = document.createElement("div");
    liftDiv.classList.add("lift");
    liftDiv.style.transition = "transform 2s linear";
    liftDiv.id = `lift-${i}`;

    const leftDoor = document.createElement("div");
    leftDoor.classList.add("lift__door", "lift__door-left");
    const rightDoor = document.createElement("div");
    rightDoor.classList.add("lift__door", "lift__door-right");

    liftDiv.appendChild(leftDoor);
    liftDiv.appendChild(rightDoor);

    const liftWidth = 60;
    const totalWidth = simulationContainer.clientWidth - 40;
    const spacing = totalWidth / (numberOfLifts + 1);

    liftDiv.style.left = `${spacing * i - liftWidth / 2}px`;

    const groundFloorOffset = Math.abs(lowestFloor) * floorHeight;
    liftDiv.style.transform = `translateY(-${groundFloorOffset}px)`;

    liftContainer.appendChild(liftDiv);

    const liftStateObj = {
      id: `lift-${i}`,
      currentFloor: 0,
      targetFloor: null,
      moving: false,
      direction: null,
      element: liftDiv,
      requestedFloors: new Set(),
    };
    lifts.push(liftStateObj);
  }

  simulationContainer.appendChild(liftContainer);
}

function requestLift(floor, direction) {
  const availableLift = findNearestAvailableLift(floor);

  if (availableLift) {
    if (availableLift.currentFloor !== floor) {
      availableLift.targetFloor = floor;
      availableLift.direction = direction;
      availableLift.requestedFloors.add(floor);
      moveLift(availableLift);
    } else {
      openLiftDoors(availableLift);
    }
  } else {
    liftRequestQueue.push({ floor, direction });
  }
}

function findNearestAvailableLift(floor) {
  let nearestLift = null;
  let shortestDistance = Infinity;

  for (const lift of lifts) {
    if (!lift.moving) {
      const distance = Math.abs(lift.currentFloor - floor + 1);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLift = lift;
      }
    }
  }

  return nearestLift;
}

function moveLift(lift) {
  if (!lift.moving && !lift.doorsOperating) {
    lift.moving = true;
    moveToNextFloor(lift);
  }
}

function openLiftDoors(lift) {
  lift.doorsOperating = true;
  lift.element.classList.add("doors-open");

  setTimeout(() => {
    lift.element.classList.remove("doors-open");

    setTimeout(() => {
      lift.doorsOperating = false;
      lift.requestedFloors.delete(lift.currentFloor);

      if (lift.requestedFloors.size > 0) {
        lift.targetFloor = findNextTargetFloor(lift);
        moveLift(lift);
      } else {
        lift.moving = false;
        lift.direction = null;
        processLiftQueue();
      }
    }, 5000);
  }, 5000);
}

function moveToNextFloor(lift) {
  if (lift.doorsOperating) {
    setTimeout(() => moveToNextFloor(lift), 100);
    return;
  }

  const currentFloor = lift.currentFloor;
  const targetFloor = lift.targetFloor;

  if (currentFloor === targetFloor) {
    openLiftDoors(lift);
    return;
  }

  const nextFloor =
    currentFloor < targetFloor ? currentFloor + 1 : currentFloor - 1;
  const floorHeight = 100;
  const lowestFloor = Math.min(0, liftDataStore.floors);
  const movement = (nextFloor - lowestFloor) * floorHeight;

  lift.element.style.transform = `translateY(-${movement}px)`;

  setTimeout(() => {
    lift.currentFloor = nextFloor;
    if (lift.requestedFloors.has(nextFloor)) {
      openLiftDoors(lift);
    } else {
      moveToNextFloor(lift);
    }
  }, 2000);
}

function findNextTargetFloor(lift) {
  const currentFloor = lift.currentFloor;
  const requestedFloors = Array.from(lift.requestedFloors);

  if (lift.direction === "up") {
    const floorsAbove = requestedFloors.filter((floor) => floor > currentFloor);
    return floorsAbove.length > 0
      ? Math.min(...floorsAbove)
      : Math.max(...requestedFloors);
  } else if (lift.direction === "down") {
    const floorsBelow = requestedFloors.filter((floor) => floor < currentFloor);
    return floorsBelow.length > 0
      ? Math.max(...floorsBelow)
      : Math.min(...requestedFloors);
  } else {
    return requestedFloors[0];
  }
}

function processLiftQueue() {
  if (liftRequestQueue.length > 0) {
    const nextRequest = liftRequestQueue.shift();
    const availableLift = findNearestAvailableLift(nextRequest.floor);

    if (availableLift) {
      availableLift.targetFloor = nextRequest.floor;
      availableLift.direction = nextRequest.direction;
      availableLift.requestedFloors.add(nextRequest.floor);
      moveLift(availableLift);
    } else {
      liftRequestQueue.unshift(nextRequest);
    }
  }
}

simulateBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const floors = document.getElementById("input-floors-count");
  const lifts = document.getElementById("input-lifts-count");

  const numberOfFloors = parseInt(floors.value);
  const numberOfLifts = Math.abs(parseInt(lifts.value));

  if (isNaN(numberOfFloors) || isNaN(numberOfLifts)) {
    alert("Please enter valid numbers!");
    return;
  }

  if (numberOfFloors === 0) {
    alert(
      "There must be at least two floors including ground floor for simulation. Try above ground floors with positive and basement floors with negative numbers."
    );
    return;
  }

  if (numberOfLifts < 1) {
    alert("There should be atleast 1 lift to simulate!");
    return;
  }

  liftDataStore.floors = numberOfFloors;
  liftDataStore.lifts = numberOfLifts;

  initializeSimulation(numberOfFloors, numberOfLifts);
});
