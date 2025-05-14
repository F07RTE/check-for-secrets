const fs = require("fs");
const configFile = require("../checkforsecrets.config.json");

function addFileToIgnoredFilesList(filePath) {
  configFile.ignoredFiles.push(filePath);
  const configString = JSON.stringify(configFile, null, 2);
  fs.writeFileSync("checkforsecrets.config.json", configString);

  process.stdout.write("\n\n🟢 File added to ignored files list 🙂\n\n");
  process.exit(0);
}

module.exports = { addFileToIgnoredFilesList };
