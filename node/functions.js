const https = require("https");

async function serverVersion() {
  const gitPackageJsonUrl =
    "https://raw.githubusercontent.com/maycorolbuche/votofacil/main/package.json";

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.get(gitPackageJsonUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      req.on("error", (err) => {
        reject(err);
      });
    });

    const remotePackageJson = JSON.parse(response);
    const remoteVersion = remotePackageJson.version;

    return remoteVersion;
  } catch (err) {
    console.error("Error fetching the remote package.json:", err);
    return null;
  }
}

function validateParams(params) {
  if (!params["room_name"]) {
    params["room_name"] = "Sala de Votação";
  }
  return Object.assign({}, { ...params });
}

module.exports = { serverVersion, validateParams };
