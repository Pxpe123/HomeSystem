const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8480 });

wss.on("connection", function connection(ws) {
  console.log("WebSocket connection established");

  ws.on("message", function incoming(message) {
    const messageString = message.toString();

    if (messageString.startsWith("{") && messageString.endsWith("}")) {
      try {
        const { action, data } = JSON.parse(messageString);
        if (action === "sendPcSpecs") {
          console.log("Received PC Specs from client");

          const jsonData = JSON.stringify(data, null, 2);

          fs.writeFile("pc_specs.json", jsonData, (err) => {
            if (err) {
              console.error("Error writing PC specs to file:", err);
            } else {
              console.log("PC specs saved to pc_specs.json");
            }
          });
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    } else {
      if (messageString.startsWith("runFunction:")) {
        const functionName = messageString.split(":")[1];

        try {
          eval(`${functionName}(ws)`);
        } catch (error) {
          console.error(`Error executing function '${functionName}':`, error);
        }
      } else {
        console.error("Received non-JSON message:", messageString);
      }
    }
  });

  ws.on("close", function close() {
    console.log("WebSocket connection closed");
  });
});

console.log("WebSocket server running on port 8480");

setTimeout(() => {
  const messageToClient = "runFunction:logPcInfo";
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageToClient);
      console.log("Message sent to client:", messageToClient);
    }
  });
}, 5000);
