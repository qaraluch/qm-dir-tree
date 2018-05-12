const test = require("ava");
const path = require("path");
const { dirTree } = require("../index.js");

const dirTreeTestPath = "./lib/walk/test/fixtures/";

let dirTreeOutput;

test.before(async () => {
  dirTreeOutput = await dirTree({ path: dirTreeTestPath });
});

test("dirTree is function", t => {
  const msg = "should be a function ";
  const actual = typeof dirTree === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("return promise", async t => {
  const msg = "should return a promise ";
  const actual = typeof (await dirTree().then) === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("get walk array", async t => {
  const msg = "should return object with walk property which is array";
  const actual = dirTreeOutput.walk instanceof Array;
  const expected = true;
  t.is(actual, expected, msg);
  const msg2 = "should return walk property which is array with length > 0";
  const actual2 = dirTreeOutput.walk.length > 0;
  const expected2 = true;
  t.is(actual2, expected2, msg2);
});

test("build entries", async t => {
  const msg = "should return object with walk property which is Object";
  const actual = dirTreeOutput.entries instanceof Object;
  const expected = true;
  t.is(actual, expected, msg);
  const msg2 = "should return walk property which is array with length > 0";
  const actual2 = Object.keys(dirTreeOutput.entries).length > 0;
  const expected2 = true;
  t.is(actual2, expected2, msg2);
  const msg3 = "should entry has name property which is a String";
  const actual3 = typeof dirTreeOutput.entries[3].name === "string";
  const expected3 = true;
  t.is(actual3, expected3, msg3);
});

test("build normalized tree", async t => {
  const msg = "should return object with tree property which is Object";
  const actual = dirTreeOutput.tree instanceof Object;
  const expected = true;
  t.is(actual, expected, msg);
  const msg2 =
    "should return tree property witch childrens property which is array with length > 0";
  const actual2 = Object.keys(dirTreeOutput.tree.childrens).length > 0;
  const expected2 = true;
  t.is(actual2, expected2, msg2);
});

//helpers for test:
function rebuildTreePaths(tree, entries) {
  const getPath = id => entries[id].path;
  const { childrens } = tree;
  let newWalk = [];
  function traverse(childrensArr) {
    childrensArr.forEach(tRecord => {
      newWalk.push(getPath(tRecord.item));
      tRecord.childrens && traverse(tRecord.childrens);
    });
  }
  traverse(childrens);
  return newWalk;
}

function compareArrays(walkOriginal, walkRebuild) {
  const checkIfExists = walkRebuild => (item, idx) => {
    const compare = walkRebuild.includes(item.path);
    return compare;
  };
  const result = walkOriginal
    .map(checkIfExists(walkRebuild))
    .reduce((acc, next) => acc && next);
  return result;
}

test("reverse path-tree rebuild", async t => {
  const msg = "should arrays be the same";
  const walkOriginal = dirTreeOutput.walk;
  const walkRebuild = rebuildTreePaths(
    dirTreeOutput.tree,
    dirTreeOutput.entries
  );
  const actual = compareArrays(walkOriginal, walkRebuild);
  const expected = true;
  t.is(actual, expected, msg);
});

test("root path", async t => {
  const msg = "should be the same as passed path";
  const actual = dirTreeOutput.tree.root;
  const expected = nodePath.resolve(dirTreeTestPath);
  t.is(actual, expected, msg);
});

test("error", async t => {
  const msg = "should throw an error";
  const error = await t.throws(dirTree({ path: "./lib/walk/test/fixtures2/" }));
  t.is(
    error.message.slice(0, 38) + " ...",
    "Sth went wrong with 'dir-tree' module: ...",
    msg
  );
});

test("traverse - all items of node", async t => {
  const msg = "should return array of 5 items of of item id 11";
  const items = dirTreeOutput.getChildrensOfNode({ id: "11" });
  const actual = items.length;
  const expected = 5;
  t.is(actual, expected, msg);
});

test("traverse - no items of node", async t => {
  const msg = "should return undefined when node not found or has no childrens";
  const actual = dirTreeOutput.getChildrensOfNode({ id: "1111" }); //TODOC: have to be in parentheses
  const expected = undefined;
  t.is(actual, expected, msg);
  const actual2 = dirTreeOutput.getChildrensOfNode({ id: "12" });
  t.is(actual2, expected, msg);
});

test("traverse - all file items of node", async t => {
  const msg = "should return array of 3 file items of of item id 11";
  const items = dirTreeOutput.getChildrensOfNode({ id: "11", filter: "files" });
  const actual = items.length;
  const expected = 3;
  t.is(actual, expected, msg);
});

test("traverse - all dir items of node", async t => {
  const msg = "should return array of 2 dir items of of item id 11";
  const items = dirTreeOutput.getChildrensOfNode({ id: "11", filter: "dirs" });
  const actual = items.length;
  const expected = 2;
  t.is(actual, expected, msg);
});

test("traverse - when wrong filter value returns all items of node", async t => {
  const msg = "should return array of 5 items of of item id 11";
  const items = dirTreeOutput.getChildrensOfNode({
    id: "11",
    filter: "terefere"
  });
  const actual = items.length;
  const expected = 5;
  t.is(actual, expected, msg);
});

test("traverse - all file names of node", async t => {
  const msg = "should return name 'thread1' of the item id 11";
  const namesMapper = entry => entry.name;
  const actual = dirTreeOutput.getChildrensOfNode({
    id: "11",
    whatToReturn: namesMapper
  })[0];
  const expected = "thread1.md";
  t.is(actual, expected, msg);
});
