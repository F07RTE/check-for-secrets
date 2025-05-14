const fs = require("fs");
const path = require("path");
const mockConfigPath = path.join(
  __dirname,
  "../../checkforsecrets.config.json",
);
const { addFileToIgnoredFilesList } = require("../../lib/ignoreFile");

describe("addFileToIgnoredFilesList", () => {
  let originalExit;
  let stdoutWriteSpy;

  beforeAll(() => {
    backupConfig();
  });

  afterAll(() => {
    restoreConfig();
  });

  beforeEach(() => {
    jest.resetModules();
    originalExit = process.exit;
    process.exit = jest.fn();
    stdoutWriteSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => {});
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.mock(
      "../../checkforsecrets.config.json",
      () => ({
        ignoredFiles: [],
      }),
      { virtual: true },
    );
  });

  afterEach(() => {
    process.exit = originalExit;
    stdoutWriteSpy.mockRestore();
    if (fs.writeFileSync.mockRestore) fs.writeFileSync.mockRestore();
    jest.resetModules();
  });

  it("should add the file path to ignoredFiles and write config", () => {
    const testFilePath = "test/path/to/file.js";
    addFileToIgnoredFilesList(testFilePath);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "checkforsecrets.config.json",
      expect.stringContaining("test/path/to/file.js"),
    );

    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("File added to ignored files list"),
    );

    expect(process.exit).toHaveBeenCalledWith(0);
  });
});

function backupConfig() {
  if (fs.existsSync(mockConfigPath)) {
    fs.copyFileSync(mockConfigPath, mockConfigPath + ".bak");
  }
}

function restoreConfig() {
  if (fs.existsSync(mockConfigPath + ".bak")) {
    fs.renameSync(mockConfigPath + ".bak", mockConfigPath);
  }
}
