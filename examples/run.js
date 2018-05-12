const fs = require("fs");
const util = require("util");
const { dirTree } = require("../index.js");

const writeFile = util.promisify(fs.writeFile);

const mockupPath = "./test/fixtures";

(async () => {
  try {
    //Execute:
    const walkOutput = await dirTree({
      path: mockupPath
    });

    //Saves:
    const save__dirTree = writeFile(
      "./examples/dirTree-tree.json",
      JSON.stringify(walkOutput.tree, null, 2)
    );

    const save__dirTreeEntry = writeFile(
      "./examples/dirTree-entry.json",
      JSON.stringify(walkOutput.entries[2], null, 2)
    );

    await Promise.all([save__dirTree, save__dirTreeEntry]);
  } catch (error) {
    console.error(error);
  }
})();
