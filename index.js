"use strict";

class Cursor {
	constructor(current, start, end, source) {
		this._src = source;
		this._curr = current;
		this._start = start;
		this._end = end;
	}
	current() {
		const delim = this._src._delimiter;
		const data = this._src._data;
		const start = this._start;
		const end = this._end;
		const current = data.slice(start, end);
		if(current !== this._curr) {
			let e = data.indexOf(delim, start);
			if(e === -1) { e = data.length; }
			let s = data.lastIndexOf(delim, e - 1);
			if(s === -1) { s = 0; } else { s += delim.length; }
			this._curr = data.slice(s, e);
			this._start = s;
			this._end = e;
		}
		return this._curr;
	}
	previous() {
		const delim = this._src._delimiter;
		const data = this._src._data;
		let start = this._start;
		let end = this._end;
		if(start === 0) { return null; }
		end = data.lastIndexOf(delim, end - 1);
		if(end === -1) {
			end = data.indexOf(delim);
			if(end === -1) { end = data.length; }
		}
		start = data.lastIndexOf(delim, end - 1);
		if(start === -1) { start = 0; } else { start += delim.length; }
		this._curr = data.slice(start, end);
		this._start = start;
		this._end = end;
		return this._curr;
	}
	next() {
		const delim = this._src._delimiter;
		const data = this._src._data;
		let start = this._start;
		let end = this._end;
		if(end === data.length) { return null; }
		start = data.indexOf(delim, end);
		if(start === -1) {
			start = data.lastIndexOf(delim, end - 1);
			if(start === -1) { start = 0; } else { start += delim.length; }
		} else {
			start += delim.length;
		}
		end = data.indexOf(delim, start);
		if(end === -1) { end = data.length; }
		this._curr = data.slice(start, end);
		this._start = start;
		this._end = end;
		return this._curr;
	}
}

class FTSet {
	constructor(string = "", delim = "\u0004") {
		if(!delim || typeof delim !== "string") { throw new Error("Delimiter must be a non-empty string"); }
		Object.defineProperty(this, "_delimiter", {
			value: delim,
			enumerable: false,
			writable: true
		});
		Object.defineProperty(this, "_data", {
			value: "",
			enumerable: false,
			writable: true
		});
		Object.defineProperty(this, "_size", {
			value: 0,
			enumerable: false,
			writable: true
		});
		if(string) {
			if(string instanceof FTSet) {
				this._data = string._delimiter === delim ? string._data : string._data.split(string._delimiter).join(delim);
				this._size = string._size;
			} else {
				let str;
				if(typeof string === "string") {
					str = string;
				} else if(Array.isArray(string)) {
					str = string.join(delim);
				} else if(typeof string[Symbol.iterator] === "function") {
					str = Array.from(string).join(delim);
				} else {
					throw new Error("Data must be one of String, Array, FTSet, Iterable");
				}
				if(str.indexOf(delim + delim) > -1) {
					const reg = new RegExp(`${delim}+`);
					str = str.split(reg).join(delim);
				}
				if(str.startsWith(delim)) {
					str = str.slice(delim.length);
				}
				if(str.endsWith(delim)) {
					str = str.slice(0, str.length - delim.length);
				}
				if(str) {
					this._size = 1;
					if(str.indexOf(delim) > -1) {
						for(let n = str.indexOf(delim, 0); n > -1; n = str.indexOf(delim, n + delim.length)) {
							this._size++;
						}
					}
				}
				this._data = str;
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
		const data = this._data;
		const size = this._size;
		const delim = this._delimiter;
		if(!size) { return; }
		if(size === 1) { return data; }
		const a1 = data.indexOf(delim);
		return data.slice(0, a1);
	}
	last() {
		const data = this._data;
		const size = this._size;
		const delim = this._delimiter;
		if(!size) { return; }
		if(size === 1) { return data; }
		const a1 = data.lastIndexOf(delim);
		return data.slice(a1 + delim.length);
	}
	has(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return false; }
		if(size === 1) { return data === str; }
		if(data.startsWith(str + delim)) { return true; }
		if(data.endsWith(delim + str)) { return true; }
		if(data.indexOf(delim + str + delim) > -1) { return true; }
		return false;
	}
	delete(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(size === 1) {
			if(data === str) {
				this._data = "";
				this._size = 0;
				return true;
			}
			return false;
		}
		if(data.startsWith(str + delim)) {
			this._data = data.slice(str.length + delim.length);
			this._size--;
			return true;
		}
		if(data.endsWith(delim + str)) {
			this._data = data.slice(0, data.length - str.length - delim.length);
			this._size--;
			return true;
		}
		const i = data.indexOf(delim + str + delim);
		if(i > -1) {
			this._data = data.slice(0, i) + data.slice(i + str.length + delim.length);
			this._size--;
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
		const size = this._size;
		if(!size) { return; }
		if(size === 1) { return data; }
		let a1 = Math.floor(Math.random() * data.length);
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1);
		if(a1 === -1) { a1 = 0; } else { a1 += delim.length; }
		return data.slice(a1, a2);
	}
	find(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return; }
		let a1 = data.indexOf(str);
		if(a1 === -1) { return; }
		if(size === 1) { return data; }
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1);
		if(a1 === -1) { a1 = 0; } else { a1 += delim.length; }
		return data.slice(a1, a2);
	}
	findAll(str) {
		if(typeof str !== "string" || !str) { throw new Error("Argument must be a non-empty string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return []; }
		if(size === 1) { return data.indexOf(str) > -1 ? [data] : []; }
		const array = [];
		for(let a = data.indexOf(str, 0), lastIndex = 0; a > -1; a = data.indexOf(str, lastIndex)) {
			const a2 = data.indexOf(delim, a);
			let a1 = data.lastIndexOf(delim, a - 1);
			if(a1 === -1) { a1 = 0; } else { a1 += delim.length; }
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
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return; }
		let { flags } = reg;
		if(reg.global) { flags = flags.replace("g", ""); }
		if(reg.sticky) { flags = flags.replace("y", ""); }
		const regExp = new RegExp(reg.source, flags);
		let a1 = data.match(regExp);
		if(!a1 || !a1[0]) { return; }
		if(size === 1) { return data; }
		a1 = a1.index;
		let a2 = data.indexOf(delim, a1);
		if(a2 === -1) { a2 = void 0; }
		a1 = data.lastIndexOf(delim, a1 - 1);
		if(a1 === -1) { a1 = 0; } else { a1 += delim.length; }
		return data.slice(a1, a2);
	}
	matchAll(reg) {
		if(!reg || !(reg instanceof RegExp || reg.constructor.name === "RegExp")) { throw new Error("Argument must be a regular expression"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return []; }
		let { flags } = reg;
		if(!reg.global) { flags += "g"; }
		if(reg.sticky) { flags = flags.replace("y", ""); }
		const regExp = new RegExp(reg.source, flags);
		if(size === 1) {
			const result = regExp.exec(data);
			return result && result[0] ? [data] : [];
		}
		const array = [];
		for(let result = regExp.exec(data); result && result[0]; result = regExp.exec(data)) {
			const a2 = data.indexOf(delim, result.index);
			let a1 = data.lastIndexOf(delim, result.index - 1);
			if(a1 === -1) { a1 = 0; } else { a1 += delim.length; }
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
		const size = this._size;
		if(!size) { return; }
		if(size === 1) {
			this._data = "";
			this._size = 0;
			return data;
		}
		const a1 = data.lastIndexOf(delim);
		const item = data.slice(a1 + delim.length);
		this._data = data.slice(0, a1);
		this._size--;
		return item;
	}
	shift() {
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		if(!size) { return; }
		if(size === 1) {
			this._data = "";
			this._size = 0;
			return data;
		}
		const a1 = data.indexOf(delim);
		const item = data.slice(0, a1);
		this._data = data.slice(a1 + delim.length);
		this._size--;
		return item;
	}
	concat(input) {
		const delim = this._delimiter;
		if(input instanceof FTSet && input._size) {
			this._data += delim + (input._delimiter === delim ? input._data : input._data.split(input._delimiter).join(delim));
			this._size += input.size;
		} else {
			let str;
			if(Array.isArray(input)) {
				str = input.join(delim);
			} else if(typeof input === "string") {
				str = input;
			} else if(typeof input[Symbol.iterator] === "function") {
				str = Array.from(input).join(delim);
			} else {
				throw new Error("Argument must be one of Array, FTSet, String, Iterable");
			}
			if(str.indexOf(delim + delim) > -1) {
				const reg = new RegExp(`${delim}+`);
				str = str.split(reg).join(delim);
			}
			if(str.startsWith(delim)) {
				str = str.slice(delim.length);
			}
			if(str.endsWith(delim)) {
				str = str.slice(0, str.length - delim.length);
			}
			if(str) {
				this._data += str;
				this._size++;
				if(str.indexOf(delim) > -1) {
					for(let n = str.indexOf(delim, 0); n > -1; n = str.indexOf(delim, n + delim.length)) {
						this._size++;
					}
				}
			}
		}
		return this;
	}
	clone() {
		return new FTSet(this, this._delimiter);
	}
	forEach(fn) {
		const size = this._size;
		const data = this._data;
		const delim = this._delimiter;
		for(let i = 0, a = 0, index = 0; i < size; i++) {
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
		let map;
		if(size > 999999) {
			map = [];
			for(let i = 0, a = 0, index = 0; i < size; i++) {
				a = data.indexOf(delim, index);
				if(a === -1) {
					map.push(fn(data.slice(index)));
				} else {
					map.push(fn(data.slice(index, a)));
					index = a + delim.length;
				}
			}
		} else {
			map = "";
			for(let i = 0, a = 0, index = 0; i < size; i++) {
				a = data.indexOf(delim, index);
				if(a === -1) {
					map += fn(data.slice(index));
				} else {
					map += fn(data.slice(index, a));
					index = a + delim.length;
				}
			}
		}
		return new FTSet(map, delim);
	}
	cursor(str = "") {
		if(typeof str !== "string") { throw new Error("Argument must be a string"); }
		const data = this._data;
		const delim = this._delimiter;
		const size = this._size;
		let curr;
		let start = 0;
		let end = 0;
		if(size === 1) {
			curr = data;
			end = data.length;
		} else {
			let index = 0;
			if(str) {
				const x = data.indexOf(str);
				if(x > -1) { index = x; }
			}
			end = data.indexOf(delim, index);
			if(end === -1) { end = void 0; }
			start = data.lastIndexOf(delim, index - 1);
			if(start === -1) { start = 0; } else { start += delim.length; }
			curr = data.slice(start, end);
		}
		return new Cursor(curr, start, end, this);
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
