import { create } from './utils.js';

export class Values {
	constructor(input, valueClass) {
		this.input = input;
		this.valueClass = valueClass || 'select__value';

		this.el = create('<ul class="select__values" aria-live="polite">');
		input.before(this.el);
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
	}
}
