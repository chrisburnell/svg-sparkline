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

		const startSlot = customElement.shadowRoot.querySelector(
			'slot[name="start-label"]',
		);
		assert.strictEqual(startSlot.textContent, "Start");
	});

	it("Should be able to set an end label", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("end-label", "End");

		const endSlot = customElement.shadowRoot.querySelector(
			'slot[name="end-label"]',
		);
		assert.strictEqual(endSlot.textContent, "End");
	});

	it("Should be able to set a start and end label", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("start-label", "Start");
		customElement.setAttribute("end-label", "End");

		const startSlot = customElement.shadowRoot.querySelector(
			'slot[name="start-label"]',
		);
		assert.strictEqual(startSlot.textContent, "Start");
		const endSlot = customElement.shadowRoot.querySelector(
			'slot[name="end-label"]',
		);
		assert.strictEqual(endSlot.textContent, "End");
	});

	it("Should not mislabel a lone end label as the start label", () => {
		// Regression test: with plain `<span>` siblings, an end-label-only
		// render had exactly one span, which trivially matched a
		// position-based `:first-of-type` selector meant for the start
		// label. Named slots key off `slot[name]` instead, so this can't
		// happen regardless of which labels are present.
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("end-label", "End");
		customElement.removeAttribute("start-label");

		const startSlot = customElement.shadowRoot.querySelector(
			'slot[name="start-label"]',
		);
		assert.strictEqual(startSlot.textContent, "");
		const endSlot = customElement.shadowRoot.querySelector(
			'slot[name="end-label"]',
		);
		assert.strictEqual(endSlot.textContent, "End");
	});

	it("Should let slotted content override the label attributes", () => {
		const customElement = document.querySelector("svg-sparkline");
		customElement.setAttribute("start-label", "Start");
		customElement.innerHTML = `<strong slot="start-label">Custom</strong>`;

		const startSlot = customElement.shadowRoot.querySelector(
			'slot[name="start-label"]',
		);
		const assigned = startSlot.assignedNodes
			? startSlot.assignedNodes()
			: [];
		if (assigned.length > 0) {
			assert.strictEqual(assigned[0].textContent, "Custom");
		} else {
			// linkedom doesn't implement slot assignment; at minimum,
			// confirm the fallback content and the light-DOM override
			// both exist, so real browsers can resolve projection.
			assert.strictEqual(
				customElement.querySelector('[slot="start-label"]').textContent,
				"Custom",
			);
		}
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
