const WebSocket = require("ws");
const { exec } = require("child_process");
const si = require("systeminformation");

const PC_IP = "192.168.50.77";
const PC_PORT = 8480;

const ws = new WebSocket(`ws://${PC_IP}:${PC_PORT}`);

ws.on("open", function open() {
  console.log("Connected to WebSocket server on PC");

  ws.send("Client connected");
});

ws.on("message", function incoming(message) {
  const messageString = message.toString();
  console.log("Received message from Pi:", messageString);

  if (messageString.startsWith("runFunction:")) {
    const functionName = messageString.split(":")[1];

    console.log(functionName + " was requested by the Pi.");

    try {
      eval(`${functionName}()`);
    } catch (error) {
      console.error(`Error executing function '${functionName}':`, error);
    }
  }
});

ws.on("close", function close() {
  console.log("WebSocket connection closed");
});

ws.on("error", function error(err) {
  console.error("WebSocket error:", err);
});

function triggerShutdown() {
  console.log("PC Closing");
  // exec("shutdown /s /t 0", (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error turning off PC: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`Error output: ${stderr}`);
  //     return;
  //   }
  //   console.log(`PC has been shut down: ${stdout}`);
  // });
}

async function getPcSpecs() {
  try {
    const [
      cpu,
      gpu,
      mem,
      battery,
      bluetoothDevices,
      audio,
      osInfo,
      time,
      wifi,
      diskLayout,
      currentLoad,
    ] = await Promise.all([
      si.cpu(),
      si.graphics(),
      si.mem(),
      si.battery(),
      si.bluetoothDevices(),
      si.audio(),
      si.osInfo(),
      si.time(),
      si.wifiConnections(),
      si.diskLayout(),
      si.currentLoad(),
    ]);

    const gpuControllers = gpu.controllers.map((controller) => ({
      vendor: controller.vendor,
      model: controller.model,
      bus: controller.bus,
      vram: controller.vram,
      vramDynamic: controller.vramDynamic,
      subDeviceId: controller.subDeviceId,
    }));

    const gpuDisplays = gpu.displays.map((display) => ({
      vendor: display.vendor,
      model: display.model,
      bus: display.bus,
      vram: display.vram,
      vramDynamic: display.vramDynamic,
      subDeviceId: display.subDeviceId,
    }));

    const pcSpecs = {
      cpuModel: cpu,
      gpuModel: {
        controllers: gpuControllers,
        displays: gpuDisplays,
      },
      ramTotal: mem,
      batteryInfo: battery,
      bluetoothDevices: bluetoothDevices,
      audioDevices: audio,
      osInfo: osInfo,
      timeInfo: time,
      wifiInfo: wifi,
      diskLayout: diskLayout,
      currentLoad: currentLoad,
    };

    return pcSpecs;
  } catch (error) {
    console.error("Error getting PC specs:", error);
    return null;
  }
}
async function logPcInfo() {
  const specs = await getPcSpecs();

  if (specs) {
    const messageToServer = JSON.stringify({
      action: "sendPcSpecs",
      data: specs,
    });
    ws.send(messageToServer); // Call the SendMessage function
    console.log("PC Specs sent to server");
  } else {
    console.log("Failed to retrieve PC specs.");
  }
}

getPcSpecs();
