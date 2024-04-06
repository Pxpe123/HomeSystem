const wol = require("wake_on_lan");
const { exec } = require("child_process");
const util = require("util");

let ManagerSettingsJson;
let macAddress;
let target;

async function pc_managerInit() {
  ManagerSettingsJson = await getAllPageSettings("pcManagement");
  macAddress = ManagerSettingsJson.macAddress; // Make sure this is defined in your settings
  target = ManagerSettingsJson.ipAddress; // Make sure this is defined in your settings

  console.log(ManagerSettingsJson);
  continuousCheck();
}

function togglePc() {
  wakeComputer();
}

function wakeComputer() {
  wol.wake(macAddress, function (error) {
    if (error) {
      console.error("Failed to send magic packet:", error);
    } else {
      console.log("Magic packet sent successfully");
    }
  });
}

function pcStatusCheck() {
  exec(`ping ${target}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`${target}: Offline or not reachable ${error}`);
    } else {
      console.log(`${target}: Online`);
    }
  });
}

async function continuousCheck() {
  while (true) {
    pcStatusCheck();
    await sleep(5);
  }
}
