const liftDataStore = {
  floors: 0,
  lifts: 0,
};

let lifts = [];

const simulateBtn = document.querySelector(".input-btn");
const simulationContainer = document.getElementById("simulation-container");

function initializeSimulation(numberOfFloors, numberOfLifts) {
  simulationContainer.innerHTML = "";
  lifts = [];

  // Create floors
  for (let i = numberOfFloors; i > 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");

    const controlBtnWrapper = document.createElement("div");
    controlBtnWrapper.classList.add("control-btn-wrapper");

    if (i < numberOfFloors) {
      const upButton = document.createElement("button");
      upButton.classList.add("control-button");
      upButton.textContent = "UP";
      upButton.addEventListener("click", () => requestLift(i, "up"));
      controlBtnWrapper.appendChild(upButton);
    }

    if (i > 1) {
      const downButton = document.createElement("button");
      downButton.classList.add("control-button");
      downButton.textContent = "DOWN";
      downButton.addEventListener("click", () => requestLift(i, "down"));
      controlBtnWrapper.appendChild(downButton);
    }

    floorDiv.appendChild(controlBtnWrapper);

    const floorNumber = document.createElement("div");
    floorNumber.classList.add("floor-number");
    floorNumber.textContent = `Floor ${i}`;
    floorDiv.appendChild(floorNumber);

    simulationContainer.appendChild(floorDiv);
  }

  // Create lifts
  const liftContainer = document.createElement("div");
  liftContainer.classList.add("lift-container");

  const floorHeight = 100;
  const totalHeight = floorHeight * numberOfFloors;
  liftContainer.style.height = `${totalHeight}px`;

  for (let i = 1; i <= numberOfLifts; i++) {
    const liftDiv = document.createElement("div");
    liftDiv.classList.add("lift");
    liftDiv.style.transition = "transform 2s ease-in-out";
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

    liftContainer.appendChild(liftDiv);

    const liftStateObj = {
      id: `lift-${i}`,
      currentFloor: 1,
      moving: false,
      element: liftDiv,
    };
    lifts.push(liftStateObj);
  }

  simulationContainer.appendChild(liftContainer);
}

let liftRequestQueue = [];

function requestLift(floor, direction) {
  const availableLift = lifts.find(
    (lift) => !lift.moving && lift.currentFloor !== floor
  );
  if (availableLift) {
    moveLift(availableLift.id, floor);
  } else {
    liftRequestQueue.push({ floor, direction });
    console.log(
      `Added request to queue: Floor ${floor}, Direction ${direction}`
    );
  }

  //console.log(`Lift requested at floor ${floor}, direction: ${direction}`);

  // best available lift

  // const availableLift = lifts.reduce((best, lift) => {
  //   if (lift.moving) return best;

  //   const distance = Math.abs(lift.currentFloor - floor);

  //   if (!best) return lift;

  //   const bestDistance = Math.abs(best.currentFloor - floor);

  //   if (distance < bestDistance) return lift;

  //   if (distance === bestDistance) {
  //     if (direction === "up" && lift.currentFloor < floor) return lift;
  //     if (direction === "down" && lift.currentFloor > floor) return lift;
  //   }

  //   return best;
  // }, null);

  // if (availableLift) {
  //   moveLift(availableLift.id, floor);
  // }
}

function processLiftQueue() {
  if (liftRequestQueue.length > 0) {
    const nextRequest = liftRequestQueue.shift();
    const availableLift = lifts.find(
      (lift) => !lift.moving && lift.currentFloor !== nextRequest.floor
    );

    if (availableLift) {
      console.log(
        `Processing queued request: Floor ${nextRequest.floor}, Direction ${nextRequest.direction}`
      );

      moveLift(availableLift.id, nextRequest.floor);
    } else {
      //no lift available, add back to queue
      liftRequestQueue.unshift(nextRequest);
    }
  }
}

function moveLift(liftId, targetFloor) {
  const lift = lifts.find((l) => l.id === liftId);

  if (lift && !lift.moving) {
    lift.moving = true;
    const floorHeight = 100;
    const movement = (targetFloor - 1) * floorHeight;

    // move the lift
    lift.element.style.transform = `translateY(-${movement}px)`;

    //wait for lift to arrive at the target floor
    setTimeout(() => {
      //open doors
      lift.element.classList.add("doors-open");

      setTimeout(() => {
        // cloors doors
        lift.element.classList.remove("doors-open");

        // Wait for doors to close, then set lift as not moving
        setTimeout(() => {
          lift.moving = false;
          lift.currentFloor = targetFloor;
          processLiftQueue();
        }, 2500);
      }, 2500);
    }, 2000);
  }
}

simulateBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const floors = document.getElementById("input-floors-count");
  const lifts = document.getElementById("input-lifts-count");

  const numberOfFloors = parseInt(floors.value);
  const numberOfLifts = parseInt(lifts.value);

  liftDataStore.floors = numberOfFloors;
  liftDataStore.lifts = numberOfLifts;

  initializeSimulation(numberOfFloors, numberOfLifts);
});
