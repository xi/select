var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var KEYS = {
	BACKSPACE: 8,
	ENTER: 13,
};

var randomString = function(length) {
	var result = [];
	for (var i = 0; i < length; i++) {
		var k = Math.floor(Math.random() * chars.length);
		result.push(chars[k]);
	}
	return result.join('');
};

export class TagInput {
	constructor(id, original) {
		this.id = id;
		this.original = original;

		this.createElements();
		original.hidden = true;
		original.before(this.wrapper);
	}

	createElements() {
		this.wrapper = document.createElement('div');

		this.values = document.createElement('ul');
		this.values.className = 'select__values';
		this.values.setAttribute('aria-live', 'polite');
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

		this.updateValue();
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
				}
			}
		} else if (event.keyCode === KEYS.ENTER) {
			if (this.input.value) {
				this.onchange(event);
			}
		}
	}

	onchange(event) {
		if (this.input.value) {
			event.preventDefault();
			this.setValue(this.input.value);
		}
	}

	updateValue() {
		this.input.value = '';
		this.values.innerHTML = '';
		Array.from(this.original.options).forEach((op, i) => {
			if (op.selected) {
				var li = document.createElement('li');
				li.textContent = op.label;
				li.className = this.original.dataset.tagsValueClass || 'select__value';
				li.onclick = () => {
					op.selected = false;
					li.remove();
					this.input.focus();
				};
				this.values.append(li);
			} else if (op.hasAttribute('data-tag-custom')) {
				op.remove();
			}
		});
	}
}

Array.from(document.querySelectorAll('[data-tags]')).forEach(el => {
	new TagInput(randomString(), el);
});
