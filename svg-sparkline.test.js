import { parseHTML } from "linkedom";
import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";

describe("<svg-sparkline> Web Component", () => {
	let window, document, customElements, HTMLElement, DocumentFragment, Event;

	const defaultBody = `<svg-sparkline values="8,3,2,7,9,1,5,6,4,0,0,10,10,3,8,2,7,1,9"></svg-sparkline>`;

	before(async () => {
		window = global.window = parseHTML(`
			<!DOCTYPE html>
			<html>
				<body>
					${defaultBody}
				</body>
			</html>
		`);
		DocumentFragment = global.DocumentFragment = window.DocumentFragment;
		document = global.document = window.document;
		customElements = global.customElements = window.customElements;
		Event = global.Event = window.Event;
		HTMLElement = global.HTMLElement = window.HTMLElement;

		await import("./svg-sparkline.js");
	});

	afterEach(() => {
		document.body.innerHTML = defaultBody;
	});

	it("Should be defined in the customElements registry", () => {
		assert.strictEqual(!!customElements.get("svg-sparkline"), true);
	});

	it("Should be able to set the line to be curved", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("curve", "true");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type path",
		);
		assert.strictEqual(/C/.test(pathElement.getAttribute("d")), true);
	});

	it("Should be able to set a start label", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("start-label", "Start");

		const spanElement =
			customElement.shadowRoot.querySelector("span:first-of-type");
		assert.strictEqual(spanElement.innerText, "Start");
	});

	it("Should be able to set an end label", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("end-label", "End");

		const spanElement =
			customElement.shadowRoot.querySelector("span:last-of-type");
		assert.strictEqual(spanElement.innerText, "End");
	});

	it("Should be able to set a start and end label", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("start-label", "Start");
		customElement.setAttribute("end-label", "End");

		const spanElementFirst =
			customElement.shadowRoot.querySelector("span:first-of-type");
		assert.strictEqual(spanElementFirst.innerText, "Start");
		const spanElementSecond =
			customElement.shadowRoot.querySelector("span:last-of-type");
		assert.strictEqual(spanElementSecond.innerText, "End");
	});

	it("Should be able to set the colour of the line", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("color", "red");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type path",
		);
		assert.strictEqual(pathElement.getAttribute("stroke"), "red");
	});

	it("Should be able to set a gradient below the line", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("gradient", "true");

		const linearGradientElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type defs linearGradient",
		);
		assert.strictEqual(!!linearGradientElement, true);
	});

	it("Should be able to set a gradient colour", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("gradient", "true");
		customElement.setAttribute("gradient-color", "red");

		const stopElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type defs linearGradient stop:first-of-type",
		);
		assert.strictEqual(stopElement.getAttribute("stop-color"), "red");
	});

	it("Should be able to set a fill below the line", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("fill", "true");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type path:first-of-type",
		);
		assert.notStrictEqual(pathElement.getAttribute("fill"), "transparent");
		assert.strictEqual(pathElement.getAttribute("stroke"), "transparent");
	});

	it("Should be able to set a fill colour", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("fill", "true");
		customElement.setAttribute("fill-color", "red");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type path:first-of-type",
		);
		assert.strictEqual(pathElement.getAttribute("fill"), "red");
		assert.strictEqual(pathElement.getAttribute("stroke"), "transparent");
	});

	it("Should be able to set the colour of the endpoint", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("endpoint-color", "red");

		const circleElement = customElement.shadowRoot.querySelector(
			"svg:last-of-type circle",
		);
		assert.strictEqual(circleElement.getAttribute("fill"), "red");
	});

	it("Should be able to remove the endpoint", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("endpoint", "false");

		const circleElement = customElement.shadowRoot.querySelector(
			"svg:last-of-type circle",
		);
		assert.strictEqual(!!circleElement, false);
	});

	it("Should be able to set the radius of the endpoint", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("endpoint-width", "10");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:last-of-type circle",
		);
		assert.strictEqual(pathElement.getAttribute("r"), "5");
	});

	it("Should be able to set the width of the line", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("stroke-width", "10");

		const pathElement = customElement.shadowRoot.querySelector(
			"svg:first-of-type path",
		);
		assert.strictEqual(
			pathElement.getAttribute("stroke-width"),
			"var(--svg-sparkline-stroke-width, var(--svg-sparkline-line-width, 10))",
		);
	});

	it("Should be able to set the dimensions of the custom element", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("width", "300");
		customElement.setAttribute("height", "100");

		const svgElement = customElement.shadowRoot.querySelector("svg");
		assert.strictEqual(svgElement.getAttribute("width"), "300px");
		assert.strictEqual(svgElement.getAttribute("height"), "100px");
	});
});
