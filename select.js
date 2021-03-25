var KEYS = {
	BACKSPACE: 8,
	ENTER: 13,
	ESC: 27,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
};

class Select {
	constructor(id, original) {
		this.id = id;
		this.original = original;
		this.focus = -1;
		this.indexMap = [];

		this.createElements();
		original.hidden = true;
		original.after(this.wrapper);
	}

	createElements() {
		this.wrapper = document.createElement('div');
		this.inputWrapper = document.createElement('div');
		this.input = document.createElement('input');
		this.dropdown = document.createElement('ul');
		this.values = document.createElement('ul');

		this.wrapper.className = 'select';
		this.inputWrapper.className = 'select__input';
		this.dropdown.className = 'select__dropdown';

		this.wrapper.append(this.inputWrapper);
		this.wrapper.append(this.dropdown);
		this.inputWrapper.append(this.values);
		this.inputWrapper.append(this.input);

		this.wrapper.setAttribute('role', 'combobox');
		this.wrapper.setAttribute('aria-expanded', 'false');
		this.wrapper.setAttribute('aria-has-popup', 'listbox');
		this.input.setAttribute('aria-autocomplete', 'list');
		this.dropdown.setAttribute('role', 'listbox');
		// this.dropdown.setAttribute('aria-labelledby', 'TODO');

		this.input.autocomplete = 'off';
		this.dropdown.tabIndex = -1;

		this.input.onkeydown = this.onkeydown.bind(this);
		this.input.oninput = this.oninput.bind(this);
		this.input.onblur = this.onblur.bind(this);
		this.input.onclick = () => {
			if (this.focus === -1) {
				this.open();
			} else {
				this.close();
			}
		};

		this.updateValue();
	}

	isMatch(s) {
		var q = this.input.value.toLowerCase();
		return s.toLowerCase().indexOf(q) !== -1;
	}

	update() {
		if (this.focus !== -1 && this.dropdown.children.length) {
			Array.from(this.dropdown.children).forEach((li, i) => {
				li.classList.toggle('select--has-focus', i === this.focus);
				li.classList.toggle('select--selected', this.original.options[this.indexMap[i]].selected);
			});
			this.wrapper.setAttribute('aria-expanded', 'true');
			this.input.setAttribute('aria-activedescendant', this.id + '_option_' + this.indexMap[this.focus]);
		} else {
			this.wrapper.setAttribute('aria-expanded', 'false');
			this.input.setAttribute('aria-activedescendant', '');
		}
	}

	updateValue() {
		this.input.value = '';
		this.values.innerHTML = '';
		Array.from(this.original.options).forEach((op, i) => {
			if (op.selected) {
				var li = document.createElement('li');
				li.textContent = op.label;
				li.onclick = () => {
					this.original.options[i].selected = false;
					li.remove();
				};
				this.values.append(li);
			}
		});
	}

	open() {
		this.focus = 0;
		this.dropdown.innerHTML = '';
		this.indexMap = [];
		Array.from(this.original.options).forEach((op, i) => {
			if (this.isMatch(op.label)) {
				var li = document.createElement('li');
				li.id = this.id + '_option_' + i;
				li.textContent = op.label;
				li.onclick = () => {
					this.setValue(i, true);
					this.input.focus();
				};
				this.dropdown.append(li);
				this.indexMap.push(i);
			}
		});
		this.update();
	}

	close() {
		this.focus = -1;
		this.dropdown.innerHTML = '';
		this.indexMap = [];
		this.update();
	}

	moveFocus(k) {
		this.focus += k;
		this.focus = Math.max(this.focus, 0);
		this.focus = Math.min(this.focus, this.dropdown.children.length - 1);
		this.dropdown.children[this.focus].scrollIntoView({block: 'nearest'});
		this.update();
	}

	setValue(i, toggle) {
		if (toggle) {
			this.original.options[i].selected = !this.original.options[i].selected;
		} else {
			this.original.options[i].selected = true;
		}
		this.original.dispatchEvent(new Event('change'));
		this.close();
		this.update();
		this.updateValue();
	}

	onkeydown(event) {
		if (this.focus !== -1) {
			if (event.keyCode === KEYS.DOWN) {
				event.preventDefault();
				this.moveFocus(1);
			} else if (event.keyCode === KEYS.PAGE_DOWN) {
				event.preventDefault();
				this.moveFocus(10);
			} else if (event.keyCode === KEYS.UP) {
				event.preventDefault();
				this.moveFocus(-1);
			} else if (event.keyCode === KEYS.PAGE_UP) {
				event.preventDefault();
				this.moveFocus(-10);
			} else if (event.keyCode === KEYS.ENTER) {
				event.preventDefault();
				this.setValue(this.indexMap[this.focus]);
			} else if (
				event.keyCode === KEYS.ESC
				|| event.keyCode === KEYS.LEFT
				|| event.keyCode === KEYS.RIGHT
			) {
				this.close();
			}
		} else {
			if (event.keyCode === KEYS.DOWN) {
				event.preventDefault();
				this.open();
			}
		}
		if (!this.input.value && event.keyCode === KEYS.BACKSPACE) {
			event.preventDefault();
			var n = this.original.selectedOptions.length;
			if (n) {
				var op = this.original.selectedOptions[n - 1];
				op.selected = false;
				this.updateValue();
				this.input.value = op.label;
			}
		}
	}

	oninput(event) {
		this.open();
		if (Array.from(this.original.options).some(op => this.isMatch(op.label))) {
			this.input.setCustomValidity('');
		} else {
			this.input.setCustomValidity('invalid choice');
		}
	}

	onblur(event) {
		if (event.relatedTarget !== this.dropdown) {
			if (this.indexMap.length) {
				this.setValue(this.indexMap[this.focus]);
			}
			this.close();
		}
	}
}

new Select('id_select', document.querySelector('select'));
