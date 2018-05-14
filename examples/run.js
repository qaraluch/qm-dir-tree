const fs = require("fs");
const util = require("util");
const { dirTree } = require("../index.js");

const writeFile = util.promisify(fs.writeFile);

const mockupPath = "./test/fixtures";

(async () => {
  try {
    //Execute:
    const dirTreeOutput = await dirTree({
      path: mockupPath
    });

    //Saves:
    const save__dirTree = writeFile(
      "./examples/dirTree-tree.json",
      JSON.stringify(dirTreeOutput.tree, null, 2)
    );

    const save__dirTreeEntry = writeFile(
      "./examples/dirTree-entry.json",
      JSON.stringify(dirTreeOutput.entries[2], null, 2)
    );

    const save__dirTreeEntries = writeFile(
      "./examples/dirTree-entries.json",
      JSON.stringify(dirTreeOutput.entries, null, 2)
    );

    const save__dirTreePaths = writeFile(
      "./examples/dirTree-paths.json",
      JSON.stringify(
        Object.values(dirTreeOutput.entries).map(item => item.path),
        null,
        2
      )
    );

    await Promise.all([
      save__dirTree,
      save__dirTreeEntry,
      save__dirTreeEntries,
      save__dirTreePaths
    ]);
  } catch (error) {
    console.error(error);
  }
})();
