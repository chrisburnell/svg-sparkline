# `svg-sparkline`

A Web Component that builds an SVG Sparkline.

**[Demo](https://chrisburnell.github.io/svg-sparkline/demo.html)** | **[Further reading](https://chrisburnell.com/svg-sparkline/)**

## Examples

### General usage example

```html
<script type="module" src="svg-sparkline.js"></script>

<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9"></svg-sparkline>
```

### With curve

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" curve="true"></svg-sparkline>
```

### Start and End labels

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" start-label="Start" end-label="End"></svg-sparkline>
```

### Animated

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" animate="true"></svg-sparkline>
```

### Defined Animation Duration

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" animate="true" animation-duration="2s"></svg-sparkline>
```

### Defined Animation Delay

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" animate="true" animation-delay="2s"></svg-sparkline>
```

### Defined color

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" color="purple"></svg-sparkline>
```

### With gradient

```html
<svg-sparkline values="8,3,2,7,9,1,5,6,4,10,3,8,2,7,1,9" gradient="true"></svg-sparkline>
```

### Defined gradient color

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" gradient="true" gradient-color="rebeccapurple"></svg-sparkline>
```

### Filled

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" fill="true"></svg-sparkline>
```

### Defined fill color

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" fill="true" fill-color="rebeccapurple"></svg-sparkline>
```

### Defined endpoint color

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" endpoint-color="red"></svg-sparkline>
```

### Defined endpoint width

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" endpoint-width="12"></svg-sparkline>
```

### Without endpoint

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" endpoint="false"></svg-sparkline>
```

### Defined line width

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" line-width="6"></svg-sparkline>
```

### Defined width and height

```html
<svg-sparkline values="1,4,2,6,6,3,5,2,1,2,3,8" width="400" height="100"></svg-sparkline>
```

## Features

This Web Component builds a sparkline based on the required `values` attribute.

## Installation

You have a few options (choose one of these):

1. Install via [npm](https://www.npmjs.com/package/@chrisburnell/svg-sparkline): `npm install @chrisburnell/svg-sparkline`
1. [Download the source manually from GitHub](https://github.com/chrisburnell/svg-sparkline/releases) into your project.
1. Skip this step and use the script directly via a 3rd party CDN (not recommended for production use)

### Usage

Make sure you include the `<script>` in your project (choose one of these):

```html
<!-- Host yourself -->
<script type="module" src="svg-sparkline.js"></script>
```

```html
<!-- 3rd party CDN, not recommended for production use -->
<script
  type="module"
  src="https://www.unpkg.com/@chrisburnell/svg-sparkline@1.0.3/svg-sparkline.js"
></script>
```

```html
<!-- 3rd party CDN, not recommended for production use -->
<script
  type="module"
  src="https://esm.sh/@chrisburnell/svg-sparkline@1.0.3"
></script>
```

## Credit

With thanks to the following people:

- [Zach Leatherman](https://zachleat.com) for inspiring this [Web Component repo template](https://github.com/chrisburnell/svg-sparkline)
