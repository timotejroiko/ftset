/* eslint-disable no-unused-expressions */
"use strict";

const p = require("perf_hooks").performance;
const Stringbase = require(`${__dirname}/../index.js`);

function time(fn, str) {
	const t = p.now();
	fn();
	console.log(`${str} in ${p.now() - t}ms`);
}

function randomStr(size) {
	const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let s = "";
	for(let i = 0; i < size; i++) {
		s += c[Math.floor(Math.random() * c.length)];
	}
	return s;
}

const tests = [
	{
		items: 99999,
		size: 10
	},
	{
		items: 9999,
		size: 1000
	}
];

for(const test of tests) {
	const array = [];
	const set = new Set();
	const sb = new Stringbase();
	let z;
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			array.push(randomStr(test.size));
		}
	}, `[array] pushed ${test.items} strings of ${test.size} chars`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			set.add(randomStr(test.size));
		}
	}, `[set] added ${test.items} strings of ${test.size} chars`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			sb.push(randomStr(test.size));
		}
	}, `[stringbase] pushed ${test.items} strings of ${test.size} chars`);
	// /////////////////////
	array.find(x => x.includes("abc")); // dry runs
	sb.find("abc"); // dry runs
	// /////////////////////
	z = array[5];
	time(() => {
		array.find(x => x.includes(z));
	}, "[array] found first item");
	// /////////////////////
	z = sb.first();
	time(() => {
		sb.find(z);
	}, "[stringbase] found first item");
	// /////////////////////
	z = array[array.length - 1];
	time(() => {
		array.find(x => x.includes(z));
	}, "[array] found last item");
	// /////////////////////
	z = sb.last();
	time(() => {
		sb.find(z);
	}, "[stringbase] found last item");
	// /////////////////////
	time(() => {
		array[Math.floor(Math.random() * array.length)];
	}, "[array] picked a random item");
	// /////////////////////
	time(() => {
		Array.from(set)[Math.floor(Math.random() * array.length)];
	}, "[set] picked a random item");
	// /////////////////////
	time(() => {
		sb.random();
	}, "[stringbase] picked a random item");
	// /////////////////////
	z = array[Math.floor(Math.random() * array.length)];
	time(() => {
		array.splice(array.indexOf(z), 1);
	}, "[array] deleted an item");
	// /////////////////////
	z = Array.from(set)[Math.floor(Math.random() * array.length)];
	time(() => {
		set.delete(z);
	}, "[set] deleted an item");
	// /////////////////////
	z = sb.random();
	time(() => {
		sb.delete(z);
	}, "[stringbase] deleted an item");
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items - 1; i++) {
			array.pop();
		}
	}, `[array] popped ${test.items - 1} items`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items - 1; i++) {
			sb.pop();
		}
	}, `[stringbase] popped ${test.items - 1} items`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			array.unshift(randomStr(test.size));
		}
	}, `[array] unshifted ${test.items} strings of ${test.size} chars`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			sb.unshift(randomStr(test.size));
		}
	}, `[stringbase] unshifted ${test.items} strings of ${test.size} chars`);
	// /////////////////////
	array.filter(x => x.includes("abc") > -1); // dry runs
	sb.findAll("abc"); // dry runs
	// /////////////////////
	time(() => {
		array.filter(x => x.includes("abc"));
	}, "[array] filtered for items containing \"abc\"");
	// /////////////////////
	time(() => {
		sb.findAll("abc");
	}, "[stringbase] filtered for items containing \"abc\"");
	// /////////////////////
	time(() => {
		array.filter(x => x.match(/abc/i));
	}, "[array] regex filtered for items containing /abc/i");
	// /////////////////////
	time(() => {
		sb.matchAll(/abc/i);
	}, "[stringbase] regex filtered for items containing /abc/i");
	// /////////////////////
	time(() => {
		for(const i of array) { i[0]; }
	}, "[array] iterated using for...of");
	// /////////////////////
	time(() => {
		for(const i of set) { i[0]; }
	}, "[set] iterated using for...of");
	// /////////////////////
	time(() => {
		for(const i of sb) { i[0]; }
	}, "[stringbase] iterated using for...of");
	// /////////////////////
	time(() => {
		array.forEach(x => x[0]);
	}, "[array] iterated using forEach");
	// /////////////////////
	time(() => {
		set.forEach(x => x[0]);
	}, "[set] iterated using forEach");
	// /////////////////////
	time(() => {
		sb.forEach(x => x[0]);
	}, "[stringbase] iterated using forEach");
	// /////////////////////
	time(() => {
		array.map(x => x[0]);
	}, "[array] iterated using map");
	// /////////////////////
	time(() => {
		sb.map(x => x[0]);
	}, "[stringbase] iterated using map");
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			array.shift();
		}
	}, `[array] shifted ${test.items} items`);
	// /////////////////////
	time(() => {
		for(let i = 0; i < test.items; i++) {
			sb.shift();
		}
	}, `[stringbase] shifted ${test.items} items`);
	console.log("\n");
}
