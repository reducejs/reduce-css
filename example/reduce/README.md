# Example

Suppose we want to pack css in `/path/to/src` (not including those in its subdirectories) into `/path/to/build/bundle.css`.

There are already `blue.css` and `red.css` in `/path/to/src`, and they both depend upon `/path/to/src/node_modules/reset/index.js`.

## Input

`blue.css`:
```css
@external "reset";
@import "color";
.blue {
  color: $blue;
}

```

`red.css`:
```css
@external "reset";
@external "./button";
@import "color";
.red {
  color: $red;
}

```

`reset` contains styles to be shared.
We use `@external` to declare that
it should come before `a.css` and `b.css` in the final `bundle.css`.
```css
html, body {
  margin: 0;
  padding: 0;
}

```

The `color` module is installed in `node_modules`,
and will be consumed by [`postcss`] when `@import`ed in css.
```css
$red: #FF0000;
$green: #00FF00;
$blue: #0000FF;

```

`/path/to/src/button` is a button component with a background image (`/path/to/src/button/button.png`),
as well as some styles (`/path/to/src/button/index.css`):
```css
@import "color";
.button {
  background-color: $red;
  background-image: url(button.png);
}

```
The image will be inlined or copied to the build directory
after bundling, and the url in css will also be transformed to
reference to it correctly.

## Output

`/path/to/build/bundle.css`:
```css
html, body {
  margin: 0;
  padding: 0;
}

.blue {
  color: #0000FF;
}

.button {
  background-color: #FF0000;
  background-image: url(assets/button.161fff2.png);
}
.red {
  color: #FF0000;
}

```

The background image has been renamed and copied to `/path/to/build/assets/button.161fff2.png`.

