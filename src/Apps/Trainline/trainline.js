async function trainlineInit() {
  const stations = await getAppSettings("trainTracker", "stations");
  const radioButtonsContainer = document.querySelector(".radio-buttons");

  stations.forEach((station, index) => {
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.id = `radio-${station.code.toLowerCase()}`;
    radioInput.name = "station";
    radioInput.value = station.code;
    radioInput.addEventListener("change", async () => {
      await refreshDepartureBoard(station.code);
    });

    const label = document.createElement("label");
    label.htmlFor = `radio-${station.code.toLowerCase()}`;
    label.textContent = station.alias;

    radioButtonsContainer.appendChild(radioInput);
    radioButtonsContainer.appendChild(label);

    if (index === 0) {
      radioInput.checked = true;
      refreshDepartureBoard(station.code);
    }
  });

  document
    .getElementById("trainlineForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      showNotification(
        "TrainLine",
        "Settings Saved",
        "https://img.icons8.com/ios-filled/50/spotify.png",
        "success",
        2000
      );
    });
}

async function refreshDepartureBoard(stationCode) {
  const trainBoard = document.querySelector(".train-board");
  trainBoard.innerHTML = "";

  trainBoard.innerHTML = `
  <div class="train-header grid grid-cols-3 font-bold mb-2">
  <div>Destination</div>
  <div>Departure Time</div>
  <div>Status</div>
  </div>`;

  try {
    const departures = await fetchTrainDepartures(stationCode);
    departures.forEach((train) => {
      const trainEntry = document.createElement("div");
      trainEntry.classList.add("train-entry");

      const trainInfo = document.createElement("div");
      trainInfo.classList.add("train-info");
      trainInfo.textContent = `${train.origin} to ${train.destination}`;

      const trainTime = document.createElement("div");
      trainTime.classList.add("train-time");
      trainTime.textContent = train.time;

      const trainStatus = document.createElement("div");
      trainStatus.classList.add("train-status");
      trainStatus.textContent = train.status;

      trainEntry.appendChild(trainInfo);
      trainEntry.appendChild(trainTime);
      trainEntry.appendChild(trainStatus);

      trainBoard.appendChild(trainEntry);
    });
  } catch (error) {
    console.error("Error loading train departures:", error);
  }
}

async function fetchTrainDepartures(stationCode) {
  const endpoint = `https://api.rtt.io/api/v1/json/search/${stationCode}`;
  const username = process.env.RTTAPI_USERNAME; // Stored in your .env file
  const password = process.env.RTTAPI_PASSWORD; // Stored in your .env file

  const base64Credentials = btoa(`${username}:${password}`);

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  return data.services.map((service) => ({
    time: service.locationDetail.gbttBookedDeparture,
    origin: service.locationDetail.origin[0].description,
    destination: service.locationDetail.destination[0].description,
    trainId: service.trainIdentity,
  }));
}
