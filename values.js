import { create } from './utils.js';

export class Values {
	constructor(input, valueClass) {
		this.gap = 4;
		this.input = input;
		this.valueClass = valueClass || 'select__value';

		this.el = create('<ul class="select__values" aria-live="polite">');
		input.before(this.el);

		var measureWrapper = create('<div class="select__measure" aria-hidden="true">');
		input.after(measureWrapper);

		this.measure = document.createElement('span');
		measureWrapper.append(this.measure);

		input.addEventListener('input', this.updateSize.bind(this));
		window.addEventListener('resize', this.updateSize.bind(this));
	}

	updateSize() {
		var style = getComputedStyle(this.input);

		// We may already have changed paddingTop, so we assume that original
		// paddingTop and paddingBottom are the same
		var paddingTop = parseInt(style.paddingBottom, 10);

		this.el.style.top = paddingTop + 'px';
		this.el.style.bottom = style.paddingBottom;
		this.el.style.left = style.paddingLeft;
		this.el.style.right = style.paddingRight;

		var n = this.el.children.length;
		if (n > 0) {
			var first = this.el.children[0].getBoundingClientRect();
			var last = this.el.children[n - 1].getBoundingClientRect();
			var height = last.top - first.top;
			var width = style.direction === 'ltr'
				? last.right - first.left
				: first.right - last.left;

			this.measure.textContent = this.input.value;
			var text = this.measure.getBoundingClientRect();

			if (width + this.gap + text.width < this.el.clientWidth) {
				this.input.style.paddingTop = `${paddingTop + height}px`;
				this.input.style.textIndent = `${width + this.gap}px`;
			} else {
				this.input.style.paddingTop = `${paddingTop + height + last.height + this.gap}px`;
				this.input.style.textIndent = '0';
			}
		} else {
			this.input.style.paddingTop = `${paddingTop}px`;
			this.input.style.textIndent = '0';
		}
	}

	update(original, onChange) {
		this.el.innerHTML = '';
		Array.from(original.options).forEach(op => {
			if (op.selected && op.label) {
				var li = document.createElement('li');
				li.textContent = op.label;
				li.className = this.valueClass;
				li.onclick = () => {
					op.selected = false;
					onChange();
				};
				this.el.append(li);
			} else if (!op.selected && op.hasAttribute('data-tag-custom')) {
				op.remove();
			}
		});
		this.updateSize();
	}
}
