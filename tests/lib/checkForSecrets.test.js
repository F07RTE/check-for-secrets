const { findPatternsInText } = require("../../lib/checkForSecrets");

describe("findPatternsInText", () => {
  it("finds patterns and reports line numbers", () => {
    const text = [
      "This is a safe line.",
      "This line has a password: 1234",
      "Another secret here!",
      "Nothing here.",
    ].join("\n");
    const patterns = ["password", "secret"];
    const results = findPatternsInText("test.txt", text, patterns);

    expect(results).toEqual([
      "test.txt | line 2 | string match: password",
      "test.txt | line 3 | string match: secret",
    ]);
  });
});
