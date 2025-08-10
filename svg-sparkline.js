export default class SVGSparkline extends HTMLElement {
	static register(tagName) {
		if ("customElements" in window) {
			customElements.define(tagName || "svg-sparkline", SVGSparkline);
		}
	}

	static css = `
		:host {
			--t-duration: var(--svg-sparkline-transition-duration, var(--transition-duration, 0.2s));
			--t-easing: var(--svg-sparkline-transition-easing, var(--transition-easing, ease));
			--t-delay: var(--svg-sparkline-transition-delay, var(--transition-delay, 0s));
			display: grid;
			display: inline-grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr auto;
		}
		svg {
			inline-size: auto;
			grid-column: 1 / 3;
			grid-row: 1 / 2;
			padding: var(--svg-sparkline-padding, 0.375rem);
			overflow: visible;
		}
		:is(path, circle) {
			transition: all var(--t-duration) var(--t-easing) var(--t-delay);
		}
		svg[aria-hidden] {
			pointer-events: none;
		}
		span {
			padding-inline: var(--svg-sparkline-padding, 0.375rem);
		}
		span:nth-of-type(1) {
			grid-column: 1 / 2;
			text-align: start;
		}
		span:nth-of-type(2) {
			grid-column: 2 / 3;
			text-align: end;
		}
		@media (prefers-reduced-motion: no-preference) {
			:host([animate]) {
				--a-duration: var(--svg-sparkline-animation-duration, var(--animation-duration, 1s));
				--a-easing: var(--svg-sparkline-animation-easing, var(--animation-easing, linear));
				--first-delay: var(--svg-sparkline-animation-first-delay, var(--svg-sparkline-animation-delay, var(--animation-delay, 1s)));
				--second-delay: var(--svg-sparkline-animation-second-delay, calc(var(--a-duration) + var(--first-delay)));
				& svg:first-of-type {
					clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
				}
				& svg:last-of-type,
				& span {
					opacity: 0;
				}
			}
			:host([visible]) {
				& svg:first-of-type {
					animation: swipe var(--a-duration) var(--a-easing) var(--first-delay) forwards;
				}
				& svg:last-of-type,
				& span {
					animation: fadein var(--a-duration) var(--a-easing) var(--second-delay) forwards;
				}
			}
		}
		@keyframes swipe {
			to {
				clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
			}
		}
		@keyframes fadein {
			to {
				opacity: 1;
			}
		}
	`;

	static observedAttributes = [
		"values",
		"width",
		"height",
		"color",
		"curve",
		"endpoint",
		"endpoint-color",
		"endpoint-radius",
		"endpoint-width",
		"fill",
		"fill-color",
		"gradient",
		"gradient-color",
		"line-width",
		"stroke-width",
		"start-label",
		"end-label",
		"animate",
		"animation-duration",
		"animation-easing",
		"animation-delay",
		"transition-duration",
		"transition-easing",
		"transition-delay",
	];

	connectedCallback() {
		if (!this.getAttribute("values")) {
			console.error(`Missing \`values\` attribute!`, this);
			return;
		}

		if (document.readyState !== "loading") {
			this.init();
			return;
		}

		document.addEventListener("DOMContentLoaded", () => this.init());
	}

	attributeChangedCallback() {
		this.initTemplate();
		this.setCSS();
	}

	disconnectedCallback() {
		if (this.observer) {
			this.observer.unobserve(this);
		}
	}

	render() {
		if (!this.hasAttribute("values")) {
			return;
		}

		this.values = this.getAttribute("values").split(",");
		this.width = parseFloat(this.getAttribute("width")) || 200;
		this.height = parseFloat(this.getAttribute("height")) || 36;
		this.color = this.getAttribute("color");
		this.curve =
			this.hasAttribute("curve") &&
			this.getAttribute("curve") !== "false";
		this.endpoint = this.getAttribute("endpoint") !== "false";
		this.endpointColor = this.getAttribute("endpoint-color");
		this.endpointRadius = this.getAttribute("endpoint-radius")
			? parseFloat(this.getAttribute("endpoint-radius"))
			: this.getAttribute("endpoint-width")
			? parseFloat(this.getAttribute("endpoint-width")) / 2
			: 3;
		this.fill =
			this.hasAttribute("fill") && this.getAttribute("fill") !== "false";
		this.gradient =
			this.hasAttribute("gradient") &&
			this.getAttribute("gradient") !== "false";
		this.gradientColor =
			this.getAttribute("fill-color") ||
			this.getAttribute("gradient-color");
		this.strokeWidth = this.getAttribute("stroke-width")
			? parseFloat(this.getAttribute("stroke-width"))
			: this.getAttribute("line-width")
			? parseFloat(this.getAttribute("line-width"))
			: 2;
		this.startLabel = this.getAttribute("start-label");
		this.endLabel = this.getAttribute("end-label");

		const color = this.color || `var(--svg-sparkline-color, currentColor)`;
		const strokeColor =
			this.color || `var(--svg-sparkline-stroke-color, ${color})`;
		const endpointColor =
			this.endpointColor ||
			`var(--svg-sparkline-endpoint-color, ${color})`;
		const gradientColor =
			this.gradientColor ||
			`var(--svg-sparkline-fill-color, var(--svg-sparkline-gradient-color, ${color}))`;

		let content = [];

		if (this.startLabel) {
			content.push(`<span>${this.startLabel}</span>`);
		}

		const title =
			this.title ||
			`Sparkline ranging from ${this.getMinY(
				this.values,
			)} to ${this.getMaxY(this.values)}.`;

		content.push(`
		<svg width="${this.width}px" height="${
			this.height
		}px" viewBox="${this.getViewBox(
			this.values,
		)}" preserveAspectRatio="none" role="img">
			<title>${title}</title>
		`);

		let gradientID;
		if (this.gradient) {
			gradientID = this.makeID();
			content.push(`
			<defs>
				<linearGradient id="svg-sparkline-gradient-${gradientID}" gradientTransform="rotate(90)">
					<stop offset="0%" stop-color="${gradientColor}" stop-opacity="1" />
					<stop offset="100%" stop-color="${gradientColor}" stop-opacity="0" />
				</linearGradient>
			</defs>
			`);
		}

		if (this.fill || this.gradient) {
			content.push(`
			<path
				d="${this.getPath(this.values, this.curve)} L ${this.getFinalX(
				this.values,
			)} ${this.getAdjustedMaxY(this.values)} L 0 ${this.getAdjustedMaxY(
				this.values,
			)} Z"
				fill="${
					this.fill
						? gradientColor
						: `url('#svg-sparkline-gradient-${gradientID}')`
				}"
				stroke="transparent"
			/>
			`);
		}

		content.push(`
		<path
			d="${this.getPath(this.values, this.curve)}"
			stroke="${strokeColor}"
			stroke-width="var(--svg-sparkline-stroke-width, var(--svg-sparkline-line-width, ${
				this.strokeWidth
			}))"
			stroke-linecap="round"
			fill="transparent"
			vector-effect="non-scaling-stroke"
		/>
		`);

		content.push(`</svg>`);

		if (this.endpoint) {
			content.push(`
			<svg width="${this.width}px" height="${this.height}px" viewBox="0 0 ${
				this.width
			} ${
				this.height
			}" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
				<circle r="${this.endpointRadius}" cx="${this.width}" cy="${
				(this.height / this.getAdjustedMaxY(this.values)) *
				this.getFinalY(this.values)
			}" fill="${endpointColor}"></circle>
			</svg>
			`);
		}

		if (this.endLabel) {
			content.push(`<span>${this.endLabel}</span>`);
		}

		return content.join("");
	}

	getBaseCSS() {
		let sheet = new CSSStyleSheet();
		sheet.replaceSync(SVGSparkline.css);

		return sheet;
	}

	setCSS() {
		if (typeof CSSStyleSheet === "function") {
			let stylesheets = [this.getBaseCSS()];
			[
				"animation-duration",
				"animation-easing",
				"animation-delay",
				"transition-duration",
				"transition-easing",
				"transition-delay",
			].forEach((attribute) => {
				if (this.hasAttribute(attribute)) {
					let sheet = new CSSStyleSheet();
					sheet.replaceSync(`
						:host { --${attribute}: ${this.getAttribute(attribute)}; }
					`);
					stylesheets.push(sheet);
				}
			});
			this.shadowRoot.adoptedStyleSheets = stylesheets;
		}
	}

	initTemplate() {
		if (this.shadowRoot) {
			if (this.innerHTML.trim() === "") {
				this.shadowRoot.innerHTML = this.render();
			} else {
				this.shadowRoot.innerHTML = this.innerHTML;
				this.innerHTML = "";
			}
			return;
		}

		this.attachShadow({ mode: "open" });

		this.setCSS();

		let template = document.createElement("template");
		template.innerHTML = this.render();
		this.shadowRoot.appendChild(template.content.cloneNode(true));

		const threshold = Math.min(
			Math.max(Number(this.getAttribute("threshold") || 0.333), 0),
			1,
		);

		if (
			this.hasAttribute("animate") &&
			typeof IntersectionObserver === "function"
		) {
			const observer = (this.observer = new IntersectionObserver(
				(entries, observer) => {
					if (entries[0].intersectionRatio > threshold) {
						this.setAttribute("visible", true);
						observer.unobserve(this);
					}
				},
				{ threshold: threshold },
			));
			observer.observe(this);
		}
	}

	init() {
		this.initTemplate();
	}

	maxDecimals(value, decimals = 2) {
		return +value.toFixed(decimals);
	}

	getViewBox(values) {
		return `0 0 ${values.length - 1} ${this.getAdjustedMaxY(values)}`;
	}

	lineCommand(point, i) {
		return `L ${i},${point}`;
	}

	line(ax, ay, bx, by) {
		const lengthX = bx - ax;
		const lengthY = by - ay;

		return {
			length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
			angle: Math.atan2(lengthY, lengthX),
		};
	}

	controlPoint(cx, cy, px, py, nx, ny, reverse) {
		// When the current X,Y are the first or last point of the array,
		// previous or next X,Y don't exist. Replace with current X,Y.
		px = px || cx;
		py = py || cy;
		nx = nx || cx;
		ny = ny || cy;

		const line = this.line(px, py, nx, ny);

		const smoothing = 0.2;
		const angle = line.angle + (reverse ? Math.PI : 0);
		const length = line.length * smoothing;

		const x = cx + Math.cos(angle) * length;
		const y = cy + Math.sin(angle) * length;

		return [x, y];
	}

	bezierCommand(point, i, a, maxY) {
		const [csx, csy] = this.controlPoint(
			i - 1,
			a[i - 1],
			i - 2,
			a[i - 2],
			i,
			point,
		);
		const [cex, cey] = this.controlPoint(
			i,
			point,
			i - 1,
			a[i - 1],
			i + 1,
			a[i + 1],
			true,
		);

		return `C ${this.maxDecimals(csx)},${Math.min(
			maxY,
			this.maxDecimals(csy),
		)} ${this.maxDecimals(cex)},${Math.min(
			maxY,
			this.maxDecimals(cey),
		)} ${i},${point}`;
	}

	getPath(values, curve) {
		return (
			values
				// flips each point in the vertical range
				.map((point) => Math.max(...values) - point + 1)
				// generate a string
				.reduce((acc, point, i, a) => {
					return i < 1
						? `M 0,${point}`
						: `${acc} ${
								curve
									? this.bezierCommand(
											point,
											i,
											a,
											this.getAdjustedMaxY(values),
									  )
									: this.lineCommand(point, i)
						  }`;
				}, "")
		);
	}

	getFinalX(values) {
		return values.length - 1;
	}

	getFinalY(values) {
		return Math.max(...values) - values[values.length - 1] + 1;
	}

	getMinY(values) {
		return Math.min(...values);
	}

	getMaxY(values) {
		return Math.max(...values);
	}

	getAdjustedMaxY(values) {
		return this.getMaxY(values) + 1;
	}

	makeID() {
		const SEQUENCE =
			"0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
		return Array.from({ length: 6 }).reduce((id, _) => {
			return (
				id +
				SEQUENCE.charAt(Math.floor(Math.random() * SEQUENCE.length))
			);
		}, "");
	}
}

if (
	!new URL(import.meta.url).searchParams.has("nodefine") &&
	!new URL(import.meta.url).searchParams.has("noregister")
) {
	SVGSparkline.register();
}
