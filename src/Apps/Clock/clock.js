let ClockSettingsJson; // Assume this variable holds the settings JSON data

async function clockInit() {
  let clockMainText = document.getElementById("clockMainText");

  ClockSettingsJson = await getAllPageSettings("clock");

  console.log(ClockSettingsJson);

  if (clockMainText) {
    clockGetTime(clockMainText);
    setInterval(() => clockGetTime(clockMainText), 500);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 100));
    clockInit();
  }
}

function clockGetTime(element) {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  let meridiem = ""; // Initialize meridiem variable

  element.style.fontSize = "1000%"; // Set font size to 1000%
  if (ClockSettingsJson && ClockSettingsJson.timeFormat === "12") {
    hours = hours % 12 || 12; // Convert hours to 12-hour format
    meridiem = hours >= 12 ? " PM" : " AM"; // Determine AM or PM
    element.style.fontSize = "800%";
  }

  const timeString = `${hours}:${minutes}:${seconds}${meridiem}`.trim(); // Trim to remove whitespace if 'meridiem' is empty

  element.textContent = timeString;
}
