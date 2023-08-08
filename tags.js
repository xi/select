import { KEYS, randomString, create } from './utils.js';

export class TagInput {
	constructor(id, original) {
		this.id = id;
		this.original = original;
		this.separators = (original.dataset.tagsSeparators || 'Enter').split(/\s+/)

		this.createElements();
		original.hidden = true;
		original.before(this.wrapper);
	}

	createElements() {
		this.wrapper = document.createElement('div');

		this.values = create('<ul class="select__values" aria-live="polite">');
		this.wrapper.append(this.values);

		this.input = document.createElement('input');
		this.input.className = this.original.dataset.tagsInputClass || '';
		this.wrapper.append(this.input);

		this.datalist = document.createElement('datalist');
		this.datalist.innerHTML = this.original.innerHTML;
		this.datalist.id = this.id + '-list';
		this.input.setAttribute('list', this.datalist.id);
		this.wrapper.append(this.datalist);

		this.input.disabled = this.original.disabled;

		this.input.onkeydown = this.onkeydown.bind(this);
		this.input.onchange = this.onchange.bind(this);

		this.original.oninvalid = () => {
			this.input.setCustomValidity(this.original.validationMessage);
			this.input.reportValiditiy();
		};
		this.original.onchange = () => {
			this.input.setCustomValidity(this.original.validationMessage);
		};

		this.updateValue();
	}

	updateValue() {
		this.input.value = '';
		this.values.innerHTML = '';
		Array.from(this.original.options).forEach(op => {
			if (op.selected && op.label) {
				var li = document.createElement('li');
				li.textContent = op.label;
				li.className = this.original.dataset.tagsValueClass || 'select__value';
				li.onclick = () => {
					op.selected = false;
					this.updateValue();
					this.input.focus();
				};
				this.values.append(li);
			} else if (!op.selected && op.hasAttribute('data-tag-custom')) {
				op.remove();
			}
		});
	}

	setValue(value) {
		var option = Array.from(this.original.options).find(op => op.value === value);
		if (!option) {
			option = document.createElement('option');
			option.setAttribute('data-tag-custom', '');
			option.value = value;
			option.label = value;
			this.original.append(option);
		}
		option.selected = true;
		this.original.dispatchEvent(new Event('change'));
		this.updateValue();
	}

	onkeydown(event) {
		if (event.keyCode === KEYS.BACKSPACE) {
			if (!this.input.value) {
				event.preventDefault();
				var n = this.original.selectedOptions.length;
				if (n) {
					var op = this.original.selectedOptions[n - 1];
					op.selected = false;
					this.updateValue();
					this.input.value = op.value;
					this.input.dispatchEvent(new Event('input'));
				}
			}
		} else if (this.separators.includes(event.key)) {
			if (this.input.value) {
				this.onchange(event);
			}
		}
	}

	onchange(event) {
		if (this.input.value.trim()) {
			event.preventDefault();
			this.setValue(this.input.value.trim());
		}
	}
}

Array.from(document.querySelectorAll('[data-tags]')).forEach(el => {
	new TagInput(randomString(8), el);
});
