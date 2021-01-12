"use strict";

class FTSet {
	constructor(_string = "", _delimiter = "\u0004") {
		let string = _string;
		if(typeof _delimiter !== "string") {
			throw new Error("Delimiter must be a non-empty string");
		}
		if(typeof string === "string") {
			// no-op
		} else if(Array.isArray(string)) {
			string = string.join(_delimiter);
		} else if(string instanceof FTSet) {
			string = string._data;
		} else if(typeof string[Symbol.iterator] === "function") {
			string = Array.from(string).join(_delimiter);
		} else {
			throw new Error("Data must be one of String, Array, FTSet, Iterable");
		}
		Object.defineProperty(this, "_data", {
			value: string,
			enumerable: false,
			writable: true
		});
		Object.defineProperty(this, "_delimiter", {
			value: _delimiter,
			enumerable: false,
			writable: true
		});
		Object.defineProperty(this, "_size", {
			value: Number(Boolean(this._data.length)),
			enumerable: false,
			writable: true
		});
		if(this._size) {
			const delim = this._delimiter;
			if(this._data.indexOf(delim + delim) > -1) {
				const reg = new RegExp(`${delim}+`);
				this._data = this._data.split(reg).join(delim);
			}
			if(this._data.indexOf(this._delimiter) === 0) {
				this._data = this._data.slice(delim.length);
			}
			if(this._data.lastIndexOf(delim) === this._data.length - 1) {
				this._data = this._data.slice(0, this._data.length - 1);
			}
			for(let n = this._data.indexOf(delim, 0); n > -1; n = this._data.indexOf(delim, n + delim.length)) {
				this._size++;
			}
		}
	}
	get delimiter() {
		return this._delimiter;
	}
	set delimiter(str) {
		if(typeof str !== "string" || !str) { throw new Error("Delimiter must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		this._data = data.split(delim).join(str);
		this._delimiter = str;
	}
	get size() {
		return this._size;
	}
	get length() {
		return this._data.length;
	}
	first() {
		const a1 = this._data.indexOf(this._delimiter);
		return this._data.slice(0, a1);
	}
	last() {
		const a1 = this._data.lastIndexOf(this._delimiter);
		return this._data.slice(a1 + this._delimiter.length);
	}
	has(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(size === 1 && data === str) { return true; }
		if(data.indexOf(str + delim) === 0) { return true; }
		if(data.endsWith(delim + str)) { return true; }
		if(data.indexOf(delim + str + delim) > -1) { return true; }
		return false;
	}
	delete(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		const { length } = this._data;
		if(size === 1 && data === str) {
			this._data = "";
			return true;
		}
		if(data.indexOf(str + delim) === 0) {
			this._data = data.slice(str.length + delim.length);
			return true;
		}
		if(data.endsWith(delim + str)) {
			this._data = data.slice(0, length - delim.length - str.length);
			return true;
		}
		let i;
		if((i = data.indexOf(delim + str + delim)) > -1) {
			this._data = data.slice(0, i) + data.slice(i + delim.length + str.length);
			return true;
		}
		return false;
	}
	clear() {
		this._data = "";
		this._size = 0;
	}
	random() {
		const data = this._data;
		const delim = this._delimiter;
		let a1 = Math.floor(Math.random() * data.length);
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1) + delim.length;
		return data.slice(a1, a2);
	}
	find(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		let a1 = data.indexOf(str);
		if(a1 === -1) { return; }
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1) + delim.length;
		return data.slice(a1, a2);
	}
	findAll(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const array = [];
		const data = this._data;
		const delim = this._delimiter;
		for(let a = data.indexOf(str, 0), lastIndex = 0; a > -1; a = data.indexOf(str, lastIndex)) {
			const a1 = data.lastIndexOf(delim, a - 1) + delim.length;
			const a2 = data.indexOf(delim, a);
			if(a2 > -1) {
				array.push(data.slice(a1, a2));
				lastIndex = a2 + delim.length;
			} else {
				array.push(data.slice(a1));
				break;
			}
		}
		return array;
	}
	match(reg) {
		if(!reg || !(reg instanceof RegExp || reg.constructor.name === "RegExp")) { throw new Error("Argument must be a regular expression"); }
		let { flags } = reg;
		if(reg.global) {
			flags = flags.replace("g", "");
		}
		if(reg.sticky) {
			flags = flags.replace("y", "");
		}
		const regExp = new RegExp(reg.source, flags);
		const data = this._data;
		const delim = this._delimiter;
		let a1 = data.match(regExp);
		if(!a1 || !a1[0]) { return null; }
		a1 = a1.index;
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1) + delim.length;
		return data.slice(a1, a2);
	}
	matchAll(reg) {
		if(!reg || !(reg instanceof RegExp || reg.constructor.name === "RegExp")) { throw new Error("Argument must be a regular expression"); }
		let { flags } = reg;
		if(!reg.global) {
			flags += "g";
		}
		if(reg.sticky) {
			flags = flags.replace("y", "");
		}
		const regExp = new RegExp(reg.source, flags);
		const data = this._data;
		const delim = this._delimiter;
		const array = [];
		for(let result = regExp.exec(data); result && result[0]; result = regExp.exec(data)) {
			const a1 = data.lastIndexOf(delim, result.index - 1) + delim.length;
			const a2 = data.indexOf(delim, result.index);
			if(a2 > -1) {
				array.push(data.slice(a1, a2));
				regExp.lastIndex = a2 + delim.length;
			} else {
				array.push(data.slice(a1));
				break;
			}
		}
		return array;
	}
	add(str) {
		return this.push(str);
	}
	push(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		if(!data) {
			this._data = str;
		} else {
			this._data += delim + str;
		}
		return ++this._size;
	}
	unshift(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		if(!data) {
			this._data = str;
		} else {
			this._data = str + delim + data;
		}
		return ++this._size;
	}
	pop() {
		const data = this._data;
		const delim = this._delimiter;
		const a1 = data.lastIndexOf(delim);
		const item = data.slice(a1 + delim.length);
		this._data = data.slice(0, a1);
		this._size--;
		return item;
	}
	shift() {
		const data = this._data;
		const delim = this._delimiter;
		const a1 = data.indexOf(delim);
		const item = data.slice(0, a1);
		this._data = data.slice(a1 + delim.length);
		this._size--;
		return item;
	}
	concat(input) {
		const delim = this._delimiter;
		if(Array.isArray(input)) {
			this._data += delim + input.join(delim);
			this._size += input.length;
		} else if(input instanceof FTSet) {
			this._data += delim + (input._delimiter === delim ? input._data : input._data.split(input._delimiter).join(delim));
			this._size += input.size;
		} else if(typeof input === "string") {
			this._data += input;
			this._size += input.split(delim).length;
		} else if(typeof input[Symbol.iterator] === "function") {
			const arr = Array.from(input);
			this._data += arr.join(delim);
			this._size += arr.length;
		} else {
			throw new Error("Argument must be one of Array, FTSet, String, Iterable");
		}
		return this;
	}
	clone() {
		return new FTSet(this._data, this._delimiter);
	}
	forEach(fn) {
		const size = this._size;
		const data = this._data;
		const delim = this._delimiter;
		let a = 0;
		let index = 0;
		for(let i = 0; i < size; i++) {
			a = data.indexOf(delim, index);
			if(a === -1) {
				fn(data.slice(index));
			} else {
				fn(data.slice(index, a));
				index = a + delim.length;
			}
		}
	}
	map(fn) {
		const size = this._size;
		const data = this._data;
		const delim = this._delimiter;
		let string = "";
		for(let i = 0, a = 0, index = 0; i < size; i++) {
			a = data.indexOf(delim, index);
			if(a === -1) {
				string += fn(data.slice(index));
			} else {
				string += fn(data.slice(index, a));
				index = a + delim.length;
			}
		}
		return new FTSet(string, delim);
	}
	cursor(str = "") {
		if(typeof str !== "string") { throw new Error("Argument must be a string"); }
		const data = this._data;
		const delim = this._delimiter;
		let index = data.indexOf(str) === -1 ? 0 : data.lastIndexOf(delim, index - 1) + delim.length;
		let x = data.indexOf(delim, index);
		if(x === -1) { x = void 0; }
		let curr = data.slice(index, x);
		const current = () => {
			return curr;
		};
		const previous = () => {
			if(!index) { return null; }
			index = data.lastIndexOf(delim, index - delim.length - 1) + delim.length;
			let b = data.indexOf(delim, index);
			if(b === -1) { b = void 0; }
			curr = data.slice(index, b);
			return curr;
		};
		const next = () => {
			const a = data.indexOf(delim, index);
			if(a === -1) { return null; }
			index = a + delim.length;
			let b = data.indexOf(delim, index);
			if(b === -1) { b = void 0; }
			curr = data.slice(index, b);
			return curr;
		};
		return {
			current,
			previous,
			next
		};
	}
	keys() {
		return { [Symbol.iterator]: () => this[Symbol.iterator]() };
	}
	values() {
		return { [Symbol.iterator]: () => this[Symbol.iterator]() };
	}
	entries() {
		return {
			[Symbol.iterator]: () => {
				const iter = this[Symbol.iterator]();
				const next = () => {
					const data = iter.next();
					data.value = [data.value, data.value];
					return data;
				};
				return { next };
			}
		};
	}
	reverse() {
		let index = this._data.length;
		let done = false;
		const d = this._data;
		const delim = this._delimiter;
		const next = () => {
			if(done) {
				return { done: true };
			}
			let data;
			const a1 = d.lastIndexOf(delim, index);
			if(a1 === -1) {
				data = {
					value: d.slice(0, index),
					done: false
				};
				done = true;
			} else {
				data = {
					value: d.slice(a1 + delim.length, index),
					done: false
				};
				index = a1 - 1;
			}
			return data;
		};
		return {
			[Symbol.iterator]: () => {
				return { next };
			}
		};
	}
	[Symbol.iterator]() {
		let index = 0;
		let done = false;
		const d = this._data;
		const delim = this._delimiter;
		const next = () => {
			if(done) {
				return { done: true };
			}
			let data;
			const a1 = d.indexOf(delim, index);
			if(a1 === -1) {
				data = {
					value: d.slice(index),
					done: false
				};
				done = true;
			} else {
				data = {
					value: d.slice(index, a1),
					done: false
				};
				index = a1 + delim.length;
			}
			return data;
		};
		return { next };
	}
	toString() {
		return this._data;
	}
	toArray() {
		const data = this._data;
		const delim = this._delimiter;
		if(!data) {
			return [];
		}
		return data.split(delim);
	}
	valueOf() {
		return this._data.length;
	}
}

module.exports = FTSet;
module.exports.FTSet = FTSet;
module.exports.default = FTSet;
