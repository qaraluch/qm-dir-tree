# qm-dir-tree

> Normalized dir tree.

:warning: Disclaimer:

This module is published in good faith and for learning purpose only. The code is not production-ready, so any usage of it is strictly at your own risk :see_no_evil:.

## Installation

```
npm i -S qm-dir-tree
```

## Usage

```js
const { dirTree } = require("qm-dir-tree");

(async () => {
  const id = "11";
  const tree = dirTree({ path: "some/path" }); // => { walk, entries, tree }

  const nodes = dirTree.getChildrensOfNode({ id, filter });
  // filter: "all" //default
  // filter: "files" / "dirs"
  // => [{tree node item}, ...]

  const entries = dirTree.getChildrensEntries({ id, filter, entryMapper });
  // when specified
  // returns childrens entries of the tree e.g.:
  // entryMapper: (entry => entry.name)
  // => [name, ...]
})();
```

## Results

tree:

```js
{
  "root": "/mnt/h/.../test/fixtures",
  "childrens": [
    {
      "item": "0",
      "childrens": [
        {
          "item": "1",
          "childrens": [
            {
              "item": "2"
            },
            {
              "item": "3"
            },
...
```

entries:

```js
{
    "0": {
    "id": 0,
    "name": "threads",
    "path": "/mnt/h/.../test/fixtures/threads",
    "stats": {
      "dev": 21,
      ...
      "isFile": false,
      "isDirectory": true,
    },
    "cwd": "/mnt/h/.../test/fixtures",
    "crown": "/threads",
    "parent": "fixtures",
    "isFile": false
  },
}
```

For more info read the source code, examples and test files :page_facing_up:.

## License

MIT © [qaraluch](https://github.com/qaraluch)
