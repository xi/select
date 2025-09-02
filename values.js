import { create } from './utils.js';

export class Values {
	constructor(input, id, valueClass, valueFocusClass) {
		this.gap = 4;
		this.focus = 0;
		this.input = input;
		this.valueClass = valueClass || 'select__value';
		this.valueFocusClass = valueFocusClass || 'select__value--focus';

		this.el = create('<ul class="select__values" role="group">');
		this.el.id = id;
		input.setAttribute('aria-describedby', this.el.id);
		input.before(this.el);

		var measureWrapper = create('<div class="select__measure" aria-hidden="true">');
		input.after(measureWrapper);

		this.measure = document.createElement('span');
		measureWrapper.append(this.measure);

		input.addEventListener('input', this.updateSize.bind(this));
		window.addEventListener('resize', this.updateSize.bind(this));
	}

	setFocus(k) {
		var n = this.el.children.length;
		k = Math.min(0, Math.max(-n, k));
		if (k !== this.focus) {
			if (this.focus !== 0) {
				const el = this.el.children[n + this.focus];
				el.classList.remove(this.valueFocusClass);
				if (this.input.getAttribute('aria-activedescendant') === el.id) {
					this.input.removeAttribute('aria-activedescendant');
				}
			}
			this.focus = k;
			if (this.focus !== 0) {
				const el = this.el.children[n + this.focus];
				el.classList.add(this.valueFocusClass);
				this.input.setAttribute('aria-activedescendant', el.id);
			}
		}
	}

	updateSize() {
		this.input.style.paddingTop = null;
		this.input.style.lineHeight = null;
		var style = getComputedStyle(this.input);

		this.el.style.inset = style.padding;
		this.el.style.borderWidth = style.borderWidth;

		var n = this.el.children.length;
		if (n > 0) {
			var first = this.el.children[0].getBoundingClientRect();
			var last = this.el.children[n - 1].getBoundingClientRect();
			var height = last.top - first.top;
			var width = style.direction === 'ltr'
				? last.right - first.left
				: first.right - last.left;

			this.measure.textContent = this.input.value;
			this.measure.style.font = style.font;
			var text = this.measure.getBoundingClientRect();

			var paddingTop = parseFloat(style.paddingTop);
			var lineHeight = style.lineHeight === 'normal'
				? text.height
				: parseFloat(style.lineHeight);

			if (first.height > lineHeight) {
				this.input.style.lineHeight = `${first.height}px`;
			}

			if (width + this.gap + text.width < this.el.clientWidth) {
				this.input.style.paddingTop = `${paddingTop + height}px`;
				this.input.style.textIndent = `${width + this.gap}px`;
			} else {
				this.input.style.paddingTop = `${paddingTop + height + last.height + this.gap}px`;
				this.input.style.textIndent = '0';
			}
		} else {
			this.input.style.textIndent = '0';
		}
	}

	update(original, onChange) {
		this.setFocus(0);
		this.el.innerHTML = '';
		Array.from(original.options).forEach((op, i) => {
			if (op.selected && op.label) {
				var li = document.createElement('li');
				li.id = `${this.el.id}-${i}`;
				li.role = 'button';
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

	onkeydown(event) {
		if (this.focus && (event.key === 'Backspace' || event.key === 'Delete')) {
			var n = this.el.children.length;
			this.el.children[n + this.focus].onclick();
		} else if (event.key === 'ArrowLeft') {
			this.setFocus(this.focus - 1);
		} else if (event.key === 'ArrowRight') {
			this.setFocus(this.focus + 1);
		} else {
			this.setFocus(0);
			return false;
		}
		return true;
	}
}
