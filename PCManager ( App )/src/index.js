const psList = require("ps-list");

const http = require("http");

function runAndVisualize(task) {
  switch (task) {
    case "shutdown":
      shutdown();
      break;
    case "apps":
      listVisualApplicationsAndLog();
      break;
    default:
      console.log("Unknown task:", task);
  }
}

function shutdown() {
  console.log("Shutting down the server...");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const task = url.searchParams.get("task");

  runAndVisualize(task);

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Task received and executed\n");
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function listVisualApplicationsAndLog() {
  try {
    const data = await psList(); // Use await to get the result of psList asynchronously
    console.log(data);
    //=> [{pid: 3213, name: 'node', cmd: 'node test.js', cpu: '0.1'}, ...]
  } catch (error) {
    console.error("Error:", error);
  }
}
