export default class SVGSparkline extends HTMLElement {
	static define(tagName?: string): void;
	static readonly css: string;
	static readonly observedAttributes: readonly string[];
	connectedCallback(): void;
	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void;
	disconnectedCallback(): void;
	observer?: IntersectionObserver;
}

export interface SVGSparklineAttributes {
	values: string;
	width?: string | number;
	height?: string | number;
	color?: string;
	curve?: boolean | "true" | "false";
	endpoint?: boolean | "true" | "false";
	"endpoint-color"?: string;
	"endpoint-radius"?: string | number;
	"endpoint-width"?: string | number;
	fill?: boolean | "true" | "false";
	"fill-color"?: string;
	gradient?: boolean | "true" | "false";
	"gradient-color"?: string;
	"stroke-width"?: string | number;
	"line-width"?: string | number;
	"start-label"?: string;
	"end-label"?: string;
	animate?: boolean | "true" | "false";
	"animation-duration"?: string;
	"animation-easing"?: string;
	"animation-delay"?: string;
	"transition-duration"?: string;
	"transition-easing"?: string;
	"transition-delay"?: string;
	threshold?: string | number;
}

declare global {
	interface HTMLElementTagNameMap {
		"svg-sparkline": SVGSparkline;
	}
}
