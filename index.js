const nodePath = require("path");
const { walkProcessed } = require("qm-walk");

function* idGenerator(initialValue = 0) {
  let id = initialValue;
  while (true) {
    yield id++;
  }
}

const cwd = process.cwd();

function buildEntries(walkOutput) {
  let entries = {};
  const idEntries = idGenerator(0);
  const itemIndexing = item => {
    let fileID = idEntries.next().value;
    entries[fileID] = {
      id: fileID,
      name: item.name,
      path: item.path,
      stats: item.stats,
      cwd: item.cwd,
      crown: item.crown,
      parent: item.parent,
      isFile: item.isFile
    };
  };
  walkOutput.map(itemIndexing);
  return entries;
}

function buildTree(walkOutput, entries, pathResolved) {
  function findItemInChildrens(toFind, childrenArr) {
    const reducer = (acc, next) => (next.item === toFind ? true : acc);
    return childrenArr.reduce(reducer, false);
  }

  function getParentOfItem(toFind, path) {
    const idx = path.split("/").findIndex(el => el === toFind);
    const result = path
      .split("/")
      .slice(idx - 1, idx)
      .join();
    return result;
  }

  function findItemIdInEntries(toFind, referencePath, entries) {
    function examineItem(entry) {
      const nameConfirmation = entry.name === toFind;
      const entryParent = getParentOfItem(toFind, entry.path);
      const referenceParent = getParentOfItem(toFind, referencePath);
      const parentConfirmation = entryParent === referenceParent;
      return nameConfirmation && parentConfirmation;
    }
    const reducer = (accId, nextId) => {
      const entry = entries[nextId];
      const result = examineItem(entry) ? nextId : accId;
      return result;
    };
    return Object.keys(entries).reduce(reducer, -1);
  }

  const treeReducer = (tree, nextItem) => {
    let nextPath = nextItem.crown; //for build nodes
    let referencePath = nextItem.path; //help for findItemInEntries
    let nextIsFile = nextItem.isFile; // for node type construction
    let pointer = tree; // v- for traversing path
    nextPath.split("/").forEach(item => {
      if (item !== "") {
        // ^- first item is empty because of first "/"
        const itemId = findItemIdInEntries(item, referencePath, entries);
        if (!findItemInChildrens(itemId, pointer.childrens)) {
          nextIsFile
            ? pointer.childrens.push({ item: itemId }) // new node for file
            : pointer.childrens.push({ item: itemId, childrens: [] }); // new node for dir
        }
        let nextPointer = pointer.childrens.filter(el => el.item === itemId);
        pointer = nextPointer[0];
      }
    });
    return tree;
  };

  return walkOutput.reduce(treeReducer, {
    root: pathResolved,
    childrens: []
  });
}

//Traverse Methods:
function _traverse(options = {}) {
  const {
    tree: { childrens },
    entries
  } = this;
  const defaultCb = (entry, item, childrens) =>
    console.log(item, entry.name, childrens && childrens.length); // eslint-disable-line no-console
  let { cb = defaultCb, deep = 0 } = options; // deep = 0 -> no deep limit
  let nextChildrens;
  let currentDeep = 1;
  function traverseIteration(cls) {
    const ifGoDeeper = deep <= 0 ? true : currentDeep < deep; //'deep <= 0' for no limit
    currentDeep++;
    cls.forEach(treeItem => {
      nextChildrens = treeItem.childrens && treeItem.childrens;
      cb(entries[treeItem.item], treeItem.item, treeItem.childrens); //childrens may be undefined
      treeItem.childrens && (ifGoDeeper && traverseIteration(nextChildrens));
    });
  }
  traverseIteration(childrens);
}

function _findItemChildrens(id) {
  let result;
  const cb = (entry, item, childrens) => {
    item === id && (result = childrens);
  };
  _traverse.call(this, { deep: 0, cb });
  return result;
}

function getChildrensOfNode({ id, filter = "all", whatToReturn = false } = {}) {
  const filterShielded =
    filter === "files" ? "files" : filter === "dirs" ? "dirs" : "all";
  const nodeChildrens = _findItemChildrens.call(this, id);
  let filteredChildrens;
  if (filterShielded === "files") {
    filteredChildrens =
      nodeChildrens &&
      nodeChildrens.filter(itm => this.entries[itm.item].isFile);
  } else if (filterShielded === "dirs") {
    filteredChildrens =
      nodeChildrens &&
      nodeChildrens.filter(itm => !this.entries[itm.item].isFile);
  } else {
    filteredChildrens = nodeChildrens;
  }
  let result;
  if (whatToReturn) {
    result = filteredChildrens
      .map(itm => this.entries[itm.item])
      .map(whatToReturn);
  } else {
    result = filteredChildrens;
  }
  return result;
}

const treeMethods = {
  getChildrensOfNode
};

async function dirTree({ path = cwd } = {}) {
  try {
    let dirTreeObject = {};
    const pathResolved = nodePath.resolve(cwd, path);
    const walkOutput = await walkProcessed({ path: pathResolved });
    const entries = buildEntries(walkOutput);
    const tree = buildTree(walkOutput, entries, pathResolved);
    dirTreeObject = { ...treeMethods, walk: walkOutput, entries, tree };
    return dirTreeObject;
  } catch (error) {
    throw new Error(
      `Sth went wrong with 'dir-tree' module: \n
        ${error.stack} \n      `
    );
  }
}

module.exports = {
  dirTree
};
