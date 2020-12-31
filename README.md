# FTSet

FTSet is an array-like data structure comparable to the javascript `Set` object but designed exclusively for storing strings and providing ultra fast full-text searching.

## FTSet VS Set VS Array

Just like a Set, FTSet is a non-indexed datastore, it only stores values and not indexes, but it also implements some features from Arrays which makes it much more flexible than a Set. However, unlike a Set, FTSet does not automatically prevent duplicate items for performance reasons. If one needs to prevent duplicates, they should always call `.has()` before inserting new data.

FTSet is something in between a Set and an Array, it is 100% compatible with the Set API but with a few additional methods borrowed from Arrays.

## Why?

Recently i found out that searching for lines that include a specific string using linux's native `grep` command on a text file is much faster than doing the same thing with the entire file loaded in memory as an array of lines, which essentially makes caching this kind of data not only useless but it actually made my entire application slower.

FTSet provides fast string matching features by storing its entire dataset as a single contiguous string. This makes the process of finding items by string matching and by regex patterns an order of magnitude faster than looping over arrays, sort of like an in-memory grep.

FTSet excels at storing a large number of strings with the purpose of quickly searching through them but may not be indicated for heavy read/write usage, check the benchmarks at the end of this readme.

## Real world example

Loading the full list of 500k+ catalogued asteroids in our solar system, downloaded from [https://www.astro.com/ftp/swisseph/ephe/seasnam.txt](https://www.astro.com/ftp/swisseph/ephe/seasnam.txt);

Basic preparations:

`npm install ftset`

```js
const { performance } = require("perf_hooks");
const { readFileSync } = require("fs");
const { execSync } = require("child_process");
const FTSet = require("ftset");

// approx. 10mb and 500k lines
let file = readFileSync("./seasnam.txt", "utf8");

// define "\n" as the delimiter, enabling the file to be used as is, no conversion or parsing needed
let fts = new FTSet(file, "\n");

// create an array of 500k items to compare with
let array = file.split("\n");
```

Case sensitive search for a single item:

```js
time = performance.now();
result = array.find(n => n.includes("Eris"));
console.log(performance.now() - time);
console.log(result);
// => 10.449599981307983
// => 136199  Eris

time = performance.now();
result = fts.find("Eris");
console.log(performance.now() - time);
console.log(result);
// => 0.38879990577697754
// => 136199  Eris
// ~ 30x faster
```

Case insensitive regex global search:

```js
// using array.filter() with regex match
time = performance.now();
result = array.filter(n => n.match(/eris/i));
console.log(performance.now() - time);
console.log(result);
/*
=> 30.59500002861023
=> [
  '000871  Amneris',
  '028688  Diannerister',
  '084225  Verish',
  '121633  Ronperison',
  '136199  Eris',
  '237845  Neris'
]
*/
```

```js
// micro-optimized arrays
reg = /eris/i;
r = [];
time = performance.now();
for(let i = 0, x = 0, b = array.length; i < b; i++) {
    if(array[i].match(reg)) {
        r[x++] = array[i];
    }
};
console.log(performance.now() - time);
console.log(r);
/*
=> 21.258599996566772
=> [
  '000871  Amneris',
  '028688  Diannerister',
  '084225  Verish',
  '121633  Ronperison',
  '136199  Eris',
  '237845  Neris'
]
*/
// about 30% performance gains but still slower than grep
```

```js
// using grep for comparison
time = performance.now();
result = child_process.execSync("LC_ALL=C grep -i -F 'eris' seasnam.txt", {encoding:"utf8"});
console.log(performance.now() - time);
console.log(result);
/*
=> 13.034613132476807
=> 000871  Amneris
028688  Diannerister
084225  Verish
121633  Ronperison
136199  Eris
237845  Neris

*/
// much faster than any iteration method
```

```js
// using FTSet.matchAll()
time = performance.now();
result = fts.matchAll(/eris/i);
console.log(performance.now() - time);
console.log(result);
/*
=> 3.0929999351501465
=> [
  '000871  Amneris',
  '028688  Diannerister',
  '084225  Verish',
  '121633  Ronperison',
  '136199  Eris',
  '237845  Neris'
]
*/
// ~ 8x faster than arrays
// ~ 4x faster than grep
```

## API

### `new FTSet(data, delimiter)` -> FTSet

Create a FTSet instance.

* `data` -> A string, array or iterable to fill the instance with. Defaults to empty string.
* `delimiter` -> A string to act as a delimiter. Defaults to the EOT character "\u0004".

### `.delimiter` -> String

Getter for the current delimiter in use. Also a setter for redefining the delimiter across the entire dataset.

### `.size` -> Number

Getter for the number of items stored in the dataset. Updated on insert and delete operations.

### `.length` -> Number

Getter for the total string length of the entire dataset including delimiters.

### `.valueOf()` -> Number

Alias for `.length`. Called automatically when coerced to number.

### `.toString()` -> String

Returns the entire dataset as a string including delimiters. Called automatically when coerced to string.

### `.toArray()` -> Array

Returns the entire dataset as an array.

### `.first()` -> String

Returns the first item stored in the dataset.

### `.last()` -> String

Returns the last item stored in the dataset.

### `.has(string)` -> Boolean

Checks if an exact match exists in the dataset. Returns a `Boolean` indicating if the item exists.

* `string` -> A non-empty string to check.

### `.delete(string)` -> Boolean

Delete an exact match from the dataset. Returns a boolean indicating if the delete was successful.

* `string` -> A non-empty string to delete from the dataset.

### `.clear()` -> Void

Deletes all items from the dataset.

### `.random()` -> String

Returns a random item from the dataset.

### `.find(query)` -> String

Returns the first item that includes the query. Case sensitive.

* `query` -> A string to search for.

### `.findAll(query)` -> Array

Returns all items that include the query. Case sensitive.

* `query` -> A string to search for.

### `.match(regex)` -> String

Returns the first match found. Case sensitive unless the `i` flag is used.

* `regex` -> A regular expression to search for.

### `.matchAll(regex)` -> Array

Returns all matches found. Case sensitive unless the `i` flag is used.

* `regex` -> A regular expression to search for.

### `.add(string)` -> Number

Alias of `.push()` for compatibility with the javascript `Set` object.

### `.push(string)` -> Number

Insert an item at the end of the dataset. Returns the total number of items after inserting.

* `string` -> A non-empty string to add to the dataset.

### `.unshift(string)` -> Number

Insert an item at the beginning of the dataset. Returns the total number of items after inserting.

* `string` -> A non-empty string to add to the dataset.

### `.pop()` -> String

Remove an item from the end of the dataset. Returns the removed item.

### `.shift()` -> String

Remove an item from the beginning of the dataset. Returns the removed item.

### `.concat(data)` -> this

Appends a number of items to the end of the dataset. Returns the current instance after appending.

* `data` -> The data to append, can be a `String`, an `Array`, an instance of `FTSet` or an `Iterable`.

### `.clone()` -> FTSet

Returns a new instance of FTSet containing a full copy of the entire dataset.

### `.forEach(fn)` -> void

Executes a function on each item of the dataset.

* `fn(item)` -> The function to execute. First argument is the current item being iterated.

### `.map(fn)` -> FTSet

Executes a function on each item of the dataset and returns a new instance of `FTSet` from the results.

* `fn(item)` -> The function to execute. First argument is the current item being iterated.

### `.cursor(string)` -> Object

Creates a cursor for navigating the dataset. If a string argument is given, the cursor will be set to the first item found using the `.find()` method, otherwise it will start from the beginning. Returns a cursor object containing three functions, `current()` (returns the current item), `previous()` (moves the cursor to the previous item and returns it) and `next()` (moves the cursor to the next item and returns it). The latter two functions will return `null` once the end is reached.

* `string` -> An optional string to define as the initial item.

### `.values()` -> Iterable

Returns an `Iterable` for compatibility with standard javascript classes.

### `.keys()` -> Iterable

Alias of `.values()` for compatibility with standard javascript classes.

### `.entries()` -> Iterable

Alias of `.values()` but calls back with `[value,value]` instead of `value`. For compatibility with standard javascript classes.

### `.reverse()` -> Iterable

Returns an `Iterable` in reverse order, starting from the last item and iterating backwards until the first item.

### `[Symbol.iterator]` -> Iterator

FTSet implements the `Iterable` and `Iterator` protocols so you can loop or iterate over an instance of FTSet directly.

## Other Benchmarks

Sample test run using the script in `bench/bench.js` on Node.js 15.3.0. Your milleage may vary depending on your CPU, your node.js version and several other factors so you are advised to perform your own tests.

Insert operations are surprisingly on pair with arrays, except for array.unshift which is absolutely terrible with a large number of items. Arrays are not designed for adding items to the beginning because the entire array needs to be reindexed, FTSet on the other hand has no problems with it. Sets cant add to the beginning and are slower because they check for value uniqueness on every insert.

|| 99999 x 10 char | 9999 x 1000 char |
|-|-|-|
| array.push() | 53.147 | 1571.854 |
| set.add() | 71.045 | 1911.027 |
| FTSet.push() | 54.402 | 1595.230 |
| array.unshift() | 17773.719 | 2077.918 |
| FTSet.unshift() | 52.290 | 1519.934 |

Search operations are what FTSet is designed for, delivering much faster performance accross the board.

|| 99999 x 10 char | 9999 x 1000 char |
|-|-|-|
| array.find(includes) near beginning |  0.081 | 0.061 |
| FTSet.find() near beginning |  0.017 | 0.012 |
| array.find(includes) near end | 6.319 | 159.263 |
| FTSet.find() near end | 0.565 | 2.734 |
| array + Math.random | 0.046 | 0.009 |
| set + Array.from + Math.random | 0.681 | 0.051 |
| FTSet.random() | 0.078 | 0.009 |
| array.filter(includes) | 7.693 | 4.573 |
| FTSet.findAll() | 0.367 | 3.142 |
| array.filter(regex) | 11.327 | 8.152 |
| FTSet.matchAll() | 0.943 | 7.965 |

Delete operations have mixed results, with Sets being the fastest at deleting, Arrays at popping and FTSet at shifting.

|| 99999 x 10 char | 9999 x 1000 char |
|-|-|-|
| array.splice() | 0.344 | 0.083 |
| set.delete() | 0.051 | 0.006 |
| FTSet.delete() | 0.368 | 2.810 |
| array.pop() | 3.361 | 2.282 |
| FTSet.pop() | 13.276 | 18.775 |
| array.shift() | 5133.597 | 3.788 |
| FTSet.shift() | 8.616 | 3.083 |

Iterating over the entire data set is faster with arrays as expected, with some strange behavior coming from Sets.

|| 99999 x 10 char | 9999 x 1000 char |
|-|-|-|
| for(let i of array) | 4.210 | 2.130 |
| for(let i of set) | 5.485 | 169.628 |
| for(let i of FTSet) | 9.509 | 3.165 |
| array.forEach() | 3.875 | 1.251 |
| set.forEach() | 3.085 | 1.106 |
| FTSet.forEach() | 4.746 | 3.225 |
| array.map() | 4.540 | 1.533 |
| FTSet.map() | 5.516 | 4.597 |

## Caveat

javascript string concatenation makes use of v8's [ConsString](https://thlorenz.com/v8-dox/build/v8-3.25.30/html/df/d91/objects_8h_source.html#l09140) class which improves performance by not concatenating immediately and instead batch-processing several concats at once when needed. This may cause the first read operation in js to be much slower than normal when performed after a write operation because the read will force any pending concatenations in v8 to be processed before the string becomes readable. This slowness scales with data size, therefore FTSet may not be recommended for general purpose read/write usage on large datasets, it works much better for read-only or read-many/write-few use cases in those situations.

Example of the delayed first read using the above asteroids dataset:

```js
time = performance.now();
result = fts.find("Eris");
console.log(performance.now() - time, result);
// => 0.39865487397210759 136199  Eris

// write some data
fts.push("abc");

time = performance.now();
result = fts.find("Eris");
console.log(performance.now() - time, result);
// => 6.963500022888184 136199  Eris
// first read up to 20x slower due to lazy concatenation
// generally should still faster than array.find()

time = performance.now();
result = fts.find("Eris");
console.log(performance.now() - time, result);
// => 0.38657467654108987 136199  Eris
// performance is back to normal from second read onwards until the next write
```
