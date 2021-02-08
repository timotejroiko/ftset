/**
 * ## FTSet
 * A string-based datastore designed for ultra fast full-text queries  
 * 
 * [FTSet on Github](https://github.com/timotejroiko/ftset)  
 * [FTSet on NPM](https://npmjs.com/package/ftset)  
 * ```js
 * const FTSet = require("ftset");
 * // or import { FTSet } from "ftset"
 * const fts = new FTSet();
 * ```
 */
declare module 'ftset' {
	
	/**
	* ## Cursor
	* ### A cursor object to navigate the dataset.
	* @typedef {Object} Cursor
	* @property {function} current Returns the current item in the cursor.
	* @property {function} previous Moves the cursor one step backwards and returns the new item.
	* @property {function} current Moves the cursor one step forwards and returns the new item.
	*/
	interface Cursor {
		/**
		* ### .current() => String
		* Get the current item from the cursor.
		*/
		current: () => string;
		
		/**
		* ### .previous() => String
		* Moves the cursor one step backwards and returns the new item.  
		* returns null if the end is reached
		*/
		previous: () => string;
		
		/**
		* ### .next() => String
		* Moves the cursor one step forward and returns the new item.  
		* Returns null if the end is reached
		*/
		next: () => string;
	}
	
	/**
	* ## FTSet
	* A string-based datastore designed for ultra fast full-text queries
	* ### Examples
	* ```js
	* const FTSet = require("ftset"); // or import { FTSet } from "ftset"
	* const fts = new FTSet();
	* fts.push("some data");
	* fts.push("ex dee");
	* fts.concat(["abc efg hij", "XYZ", "uvuvwevwevwe"]);
	* console.log(fts.find("dee")); // "ex dee";
	* console.log(fts.matchAll(/x/i)) // ["ex dee", "XYZ"];
	* for(let item of fts) {
	*     console.log(item) // "some data", "ex dee", ...
	* }
	* fts.clear();
	* ```
	*/
	export class FTSet implements Iterable<string> {
		[Symbol.iterator](): Iterator<string>;
		
		/**
		* ### new FTSet(data, delimiter) => FTSet
		* Create an instance of FTSet.
		* @param {(string | string[])} [data=""] Data to initialize the instance with. Defaults to empty string.
		* @param {string} [delimiter="\u0004"] A string to act as the delimiter. Defaults to the EOT character "\u0004".
		* @returns {FTSet} An instance of FTSet.
		* @example
		* // create an empty instance
		* const fts = new FTSet()
		* 
		* // create an instance from a delimited string
		* const fts = new FTSet("item1,item2,item3", ",")
		* 
		* // create an instance from an array or an iterable
		* const fts = new FTSet(["item1","item2","item3"])
		*/
		constructor(data?: string | string[], delimiter?: string);
		private _data: string;
		private _delimiter: string;
		private _size: number;
		delimiter: string;
		size: number;
		length: number;
		
		/**
		* ### .first() => String
		* Get the first item from the dataset.
		* @return {string} The first item from the dataset.
		*/
		first(): string;
		
		/**
		* ### .last() => String
		* Get the last item from the dataset.
		* @return {string} The last item from the dataset.
		*/
		last(): string;
		
		/**
		* ### .has(item) => Boolean
		* Checks if an exact match exists in the dataset. Returns a `Boolean` indicating if the item exists.
		* @param {string} item A non-empty string to check.
		* @returns {boolean} A boolean indicating if the item exists.
		*/
		has(item: string): boolean;
		
		/**
		* ### .delete(item) => Boolean
		* Delete an item from the dataset.
		* @param {string} item The item to delete.
		* @returns {boolean} A boolean indicating if the item was successfully deleted.
		*/
		delete(item: string): boolean;
		
		/**
		* ### .clear() => void
		* Delete all items from the dataset.
		*/
		clear(): void;
		
		/**
		* ### .random() => String
		* Get a random item from the dataset.
		* @returns {string} A random item from the dataset.
		*/
		random(): string;
		
		/**
		* ### .find(query) => String
		* Get the first item that partially matches a string. Case sensitive.
		* @param {string} query A string to search for.
		* @returns {string} The first item found.
		*/
		find(query: string): string;
		
		/**
		* ### .findAll(query) => Array
		* Get all items that partially match a string. Case sensitive.
		* @param {string} query A string to search for.
		* @returns {Array} An array of items found.
		*/
		findAll(query: string): string[];
		
		/**
		* ### .match(query) => String
		* Get the first item that matches a regular expression.
		* @param {RegExp} query A regular expression to search for.
		* @returns {string} The first item found.
		*/
		match(query: RegExp): string;
		
		/**
		* ### .matchAll(query) => String
		* Get all items that match a regular expression.
		* @param {string} query A segular expression to search for.
		* @returns {Array} An array of items found.
		*/
		matchAll(query: RegExp): string[];
		
		/**
		* ### .add(item) => Number
		* Alias for `.push()`.  
		* Inserts an item at the end of the dataset.  
		* Returns the new item count.
		* @param {string} item A string item to add to the dataset.
		* @returns {number} The number of items after inserting.
		*/
		add(item: string): number;
		
		/**
		* ### .push(item) => Number
		* Inserts an item at the end of the dataset.  
		* Returns the new item count.
		* @param {string} item A string item to add to the dataset.
		* @returns {number} The number of items after inserting.
		*/
		push(item: string): number;
		
		/**
		* ### .unshift(item) => Number
		* Inserts an item at the beginning of the dataset.  
		* Returns the new item count.
		* @param {string} item A string item to add to the dataset.
		* @returns {number} The number of items after inserting.
		*/
		unshift(item: string): number;
		
		/**
		* ### .pop() => String
		* Removes the last item from the dataset.  
		* Returns the removed item.
		* @returns {number} The removed item.
		*/
		pop(): string;
		
		/**
		* ### .shift() => String
		* Removes the first item from the dataset.  
		* Returns the removed item.
		* @returns {number} The removed item.
		*/
		shift(): string;
		
		/**
		* ### .concat(data) => FTSet
		* Inserts a number of items at the end of the dataset.  
		* Returns the current instance.
		* @param {(string | string[])} data The data to insert. Can be a string, array of strings, iterable or instance of FTSet
		* @returns {number} The current instance.
		*/
		concat(data: string | string[]): FTSet;
		
		/**
		* ### .clone(data) => FTSet
		* Returns a new instance of FTSet containing a full copy of the entire dataset.  
		* @returns {number} A new instance of FTSet.
		*/
		clone(): FTSet;
		
		/**
		* ### .forEach(callback) => Void
		* Loops over all items in the dataset and executes a callback function on each item.
		* @param {function} callback A function to execute on each item.
		*/
		forEach(callback: (item: string) => void): void;
		
		/**
		* ### .map(callback) => FTSet
		* Loops over all items in the dataset and executes a callback function on each item.  
		* Returns a new instance of FTSet containing the results.
		* @param {function} callback A function to execute on each item.
		*/
		map(callback: (item: string) => void): FTSet;
		
		/**
		* ### .cursor(query) => { current, previous, next }
		* Creates a Cursor object to navigate the dataset.  
		* If a query is specified, the Cursor will be set to the first item found.  
		* Otherwise it will be set to the first item in the dataset.
		* @param {string} query Optional query to define the initial cursor location.
		* @returns {Cursor} A Cursor object.
		* @example
		* let data = new FTSet(["a","b","c","d"]);
		* let cursor = data.cursor("b");
		* cursor.next() // "c"
		* cursor.next() // "d"
		* cursor.next() // null
		*/
		cursor(query?: string): Cursor;
		
		/**
		* ### .keys() => Iterable
		* Alias for `.values()`.  
		* Returns an iterable that loops over the entire dataset.
		* @returns {Iterable} An Iterable.
		*/
		keys(): Iterable<string>;
		
		/**
		* ### .values() => Iterable
		* Returns an iterable that loops over the entire dataset.
		* @returns {Iterable} An Iterable.
		*/
		values(): Iterable<string>;
		
		/**
		* ### .entries() => Iterable
		* Alias for `.values()` but calls back with `[value,value]` instead of `value`.  
		* Returns an iterable that loops over the entire dataset.
		* @returns {Iterable} An Iterable.
		*/
		entries(): Iterable<[string,string]>;
		
		/**
		* ### .reverse() => Iterable
		* Returns an iterable that loops over the entire dataset in reverse order.
		* @returns {Iterable} An Iterable.
		*/
		reverse(): Iterable<string>;
		
		/**
		* ### .toString() => String
		* Returns the entire dataset as a string.
		* @returns {string} The entire dataset as a string.
		*/
		toString(): string;
		
		/**
		* ### .toArray() => Array
		* Returns the entire dataset as an Array.
		* @returns {string[]} The entire dataset as an Array.
		*/
		toArray(): string[];
		
		/**
		* ### .valueOf() => Number
		* Returns the total string length of the dataset.
		* @returns {number} The total string length of the dataset.
		*/
		valueOf(): number;
	}
}