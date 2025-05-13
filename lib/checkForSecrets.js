// lib/checkForSecrets.js
function findPatternsInText(filePath, fileData, patterns) {
  const results = [];
  const lines = fileData.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    for (let patternIdx = 0; patternIdx < patterns.length; patternIdx++) {
      const regex = new RegExp(patterns[patternIdx], "i");
      const regexResult = regex.exec(line);

      if (regexResult && regexResult.length > 0) {
        for (let matchIdx = 0; matchIdx < regexResult.length; matchIdx++) {
          const patternFound = regexResult[matchIdx];
          results.push(
            `${filePath} | line ${lineIdx + 1} | string match: ${patternFound}`,
          );
        }
      }
    }
  }
  return results;
}

module.exports = { findPatternsInText };
