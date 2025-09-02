import { randomString, create } from './utils.js';
import { Values } from './values.js';

export class TagInput {
	constructor(original, options = {}) {
		this.original = original;

		this.id = options.id || randomString(8);
		this.inputClass = options.inputClass || original.dataset.tagsInputClass;
		this.valueClass = options.valueClass || original.dataset.tagsValueClass;
		this.separators = options.separators || (original.dataset.tagsSeparators || 'Enter').split(/\s+/);

		this.createElements();
		original.hidden = true;
		original.before(this.wrapper);

		this.updateValue();
	}

	createElements() {
		this.wrapper = create('<div class="select">');

		this.inputWrapper = create('<div class="select__input">');
		this.wrapper.append(this.inputWrapper);

		this.input = document.createElement('input');
		this.input.className = this.inputClass || '';
		var labels = Array.from(this.original.labels).map(label => {
			label.id = label.id || randomString(8);
			return label.id;
		}).join(' ');
		this.input.setAttribute('aria-labelledby', labels);
		this.inputWrapper.append(this.input);

		this.values = new Values(this.input, `${this.id}-values`, this.valueClass);

		this.datalist = document.createElement('datalist');
		this.datalist.innerHTML = this.original.innerHTML;
		this.datalist.id = `${this.id}-list`;
		this.input.setAttribute('list', this.datalist.id);
		this.inputWrapper.append(this.datalist);

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
	}

	updateValue() {
		this.input.value = '';
		this.values.update(this.original, () => {
			this.updateValue();
			this.input.focus();
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
		if (event.key === 'Backspace') {
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
	new TagInput(el);
});
