const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, "build");

const server = http.createServer((req, res) => {
  // Handle clean URLs by trying to append .html or serving index.html
  let cleanUrl = req.url.split("?")[0];
  let filePath = path.join(
    BUILD_DIR,
    cleanUrl === "/" ? "index.html" : cleanUrl
  );

  const extname = path.extname(filePath);
  let contentType = "text/html";
  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
    case ".svg":
      contentType = "image/svg+xml";
      break;
    case ".ico":
      contentType = "image/x-icon";
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == "ENOENT") {
        // SPA Routing: Serve index.html for unknown paths (if it's not a file request)
        if (!extname) {
          fs.readFile(path.join(BUILD_DIR, "index.html"), (err, content) => {
            if (err) {
              res.writeHead(500);
              res.end("Error loading index.html");
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(content, "utf-8");
            }
          });
        } else {
          res.writeHead(404);
          res.end("Not found");
        }
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend running on http://localhost:${PORT}`);
});
