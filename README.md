# Select

Better select widgets in vanilla javascript.

The code is intentionally very simple and close to browser defaults.

## Usage

```html
<link rel="stylesheet" href="select.css">
<script src="select.js" type="module"></script>
<script>
	new Select('myselect', element);
</script>
```

# Mobile support

This library does work on mobile. However, select usability on mobile is
usually far superior to that on desktop. Therefore it is recommended to only
use this on desktop.

## Roadmap

-	refactor constructor args
-	dynamic option creation
-	localization
-	allowClear
-	tokenSeparators

## Inspiration

-	[select2](https://select2.org/)
-	[downshift](https://www.downshift-js.com/)
-	[WAI-ARIA combobox](https://www.w3.org/TR/wai-aria-practices/#combobox)
	([examples](https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html))
-	[`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist)
