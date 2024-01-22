class SVGSparkline extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) {
      customElements.define(tagName || "svg-sparkline", SVGSparkline)
    }
  }

  static css = `
    :host {
      display: grid;
      display: inline-grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr auto;
      & svg {
        inline-size: auto;
        grid-column: 1 / 3;
        grid-row: 1 / 2;
        padding: var(--svg-sparkline-padding, 0.375rem);
        overflow: visible;
      }
      & span {
        padding-inline: var(--svg-sparkline-padding, 0.375rem);
        &:nth-of-type(1) {
          grid-column: 1 / 2;
          text-align: start;
        }
        &:nth-of-type(2) {
          grid-column: 2 / 3;
          text-align: end;
        }
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      :host([animate]) {
        svg:first-of-type {
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          animation: swipe var(--svg-sparkline-animation-duration, var(--animation-duration, 1s)) linear var(--svg-sparkline-animation-delay, var(--svg-sparkline-animation-duration, var(--animation-duration, 1s))) forwards;
        }
        svg:last-of-type,
        span {
          opacity: 0;
          animation: fadein var(--svg-sparkline-animation-duration, var(--animation-duration, 1s)) linear calc(2 * var(--svg-sparkline-animation-delay, var(--svg-sparkline-animation-duration, var(--animation-duration, 1s)))) forwards;
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
  `

  static observedAttributes = ["values", "width", "height", "color", "curve", "animation-duration", "endpoint", "endpoint-color", "endpoint-width", "fill", "gradient", "gradient-color", "line-width", "start-label", "end-label"]

  connectedCallback() {
    if (!this.getAttribute("values")) {
      console.error(`Missing \`values\` attribute!`, this)
      return
    }

    this.init()
  }

  render() {
    if (!this.hasAttribute("values")) {
      return
    }

    this.values = this.getAttribute("values").split(",")
    this.width = parseFloat(this.getAttribute("width")) || 160
    this.height = parseFloat(this.getAttribute("height")) || 28
    this.color = this.getAttribute("color") || "currentColor"
    this.curve = this.getAttribute("curve") === "true"
    this.animationDuration = this.getAttribute("animation-duration") || "1s"
    this.endpoint = this.getAttribute("endpoint") !== "false"
    this.endpointColor = this.getAttribute("endpoint-color") || this.color
    this.endpointWidth = parseFloat(this.getAttribute("endpoint-width")) || 6
    this.fill = this.getAttribute("fill") === "true"
    this.gradient = this.getAttribute("gradient") === "true"
    this.gradientColor = this.getAttribute("gradient-color") || this.getAttribute("fill-color") || this.color
    this.lineWidth = parseFloat(this.getAttribute("line-width")) || 2
    this.startLabel = this.getAttribute("start-label")
    this.endLabel = this.getAttribute("end-label")

    let content = []

    if (this.startLabel) {
      content.push(`<span>${this.startLabel}</span>`)
    }

    content.push(`
      <svg width="${this.width}px" height="${this.height}px" viewBox="${this.getViewBox(this.values)}" preserveAspectRatio="none">
    `)

    if (this.gradient || this.fill) {
      const gradientID = this.makeID(6)
      content.push(`
        <defs>
          <linearGradient id="svg-sparkline-gradient-${gradientID}" gradientTransform="rotate(90)">
            <stop offset="0%" stop-color="var(--svg-sparkline-gradient-color, ${this.gradientColor})" />
            <stop offset="100%" stop-color="transparent" />
          </linearGradient>
        </defs>
        <path
            d="${this.getPath(this.values, this.curve ? this.bezierCommand : this.lineCommand)} L ${this.getFinalX(this.values)} ${this.getHighestY(this.values)} L 0 ${this.getHighestY(this.values)} Z"
            fill="${this.fill ? `var(--svg-sparkline-gradient-color, ${this.gradientColor})` : `url('#svg-sparkline-gradient-${gradientID}')`}"
            stroke="transparent"
        />
      `)
    }

    content.push(`
      <path
          d="${this.getPath(this.values, this.curve ? this.bezierCommand : this.lineCommand)}"
          stroke="var(--svg-sparkline-color, ${this.color})"
          stroke-width="${this.lineWidth}"
          stroke-linecap="round"
          fill="transparent"
          vector-effect="non-scaling-stroke"
      />
    `)

    content.push(`</svg>`)

    if (this.endpoint) {
      content.push(`
        <svg width="${this.width}px" height="${this.height}px" viewBox="0 0 ${this.width} ${this.height}" preserveAspectRatio="xMaxYMid meet">
          <circle " r="${this.endpointWidth / 2}" cx="${this.width}" cy="${(this.height / this.getHighestY(this.values)) * this.getFinalY(this.values)}" fill="var(--svg-sparkline-endpoint-color, ${this.endpointColor})"></circle>
        </svg>
      `)
    }

    if (this.endLabel) {
      content.push(`<span>${this.endLabel}</span>`)
    }

    if (this.animate) {
      content.push(`
        <style>
          :host {
            --animation-duration: ${this.animationDuration};
          }
        </style>
      `)
    }

    return content.join("")
  }

  initTemplate() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render()
      return
    }

    let shadowroot = this.attachShadow({ mode: "open" })

    let sheet = new CSSStyleSheet()
    sheet.replaceSync(SVGSparkline.css)
    shadowroot.adoptedStyleSheets = [sheet]

    let template = document.createElement("template")
    template.innerHTML = this.render()
    shadowroot.appendChild(template.content.cloneNode(true))
  }

  async init() {
    this.initTemplate()
  }

  attributeChangedCallback() {
    this.initTemplate()
  }

  static maxDecimals(value, decimals = 2) {
    return +value.toFixed(decimals)
  }

  getViewBox(values) {
    return `0 0 ${values.length - 1} ${Math.max(...values) + 2}`
  }

  lineCommand(point, i) {
    return `L ${i},${point}`
  }

  static line(ax, ay, bx, by) {
    const lengthX = bx - ax
    const lengthY = by - ay

    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    }
  }

  static controlPoint(cx, cy, px, py, nx, ny, reverse) {
    // When the current is the first or last point of the array, previous and
    // next don't exist. Replace with current.
    px = px || cx
    py = py || cy
    nx = nx || cx
    ny = ny || cy

    const smoothing = 0.2

    const o = SVGSparkline.line(px, py, nx, ny)

    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing

    const x = cx + Math.cos(angle) * length
    const y = cy + Math.sin(angle) * length

    return [x, y]
  }

  bezierCommand(point, i, a) {
    const [csx, csy] = SVGSparkline.controlPoint(i-1, a[i-1], i-2, a[i-2], i, point)
    const [cex, cey] = SVGSparkline.controlPoint(i, point, i-1, a[i-1], i+1, a[i+1], true)

    return `C ${SVGSparkline.maxDecimals(csx)},${SVGSparkline.maxDecimals(csy)} ${SVGSparkline.maxDecimals(cex)},${SVGSparkline.maxDecimals(cey)} ${i},${point}`
  }

  getPath(values, command = this.lineCommand) {
    return values
      // flips each point in the vertical range
      .map((point) => Math.max(...values) - point + 1)
      // generate a string
      .reduce((acc, point, i, a) => {
        return i < 1 ? `M 0,${point}` : `${acc} ${command(point, i, a)}`
      }, "")
  }

  getFinalX(values) {
    return values.length - 1
  }

  getFinalY(values) {
    return Math.max(...values) - values[values.length - 1] + 1
  }

  getHighestY(values) {
    return Math.max(...values) + 2
  }

  makeID(length) {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
  }
}

SVGSparkline.register()
