const express = require("express");
const multer = require("multer");
const Docker = require("dockerode");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "container" });
const docker = new Docker();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("zipfile"), async (req, res) => {
  const filePath = path.join(__dirname, "container", "src.zip");
  fs.renameSync(req.file.path, filePath);

  docker.buildImage(
    {
      context: path.join(__dirname, "container"),
      src: ["Dockerfile", "package.json", "index.js", "src.zip"],
    },
    {
      t: "node-environment",
    },
    function (err, stream) {
      if (err) {
        console.error("Error building Docker image: ", err);
        res.status(500).send("Error building Docker image");
        return;
      }
      stream.on("data", function (data) {
        console.log(data.toString());
      });

      stream.on("end", function () {
        const outStream = new require("stream").Writable({
          write: function (chunk, encoding, next) {
            output += chunk.toString();
            next();
          },
        });
        let output = "";

        // Run the Docker container
        docker.run(
          "node-environment",
          [],
          outStream,
          async function (err, data, container) {
            if (err) {
              console.log("Error reading results: ", err);
              res.status(500).send("Error reading results");
            } else {
              console.log(output);
              res.status(200).send(output);
            }
          }
        );
      });
    }
  );
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
