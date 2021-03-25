var KEYS = {
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
		this.input = document.createElement('input');
		this.dropdown = document.createElement('ul');

		this.wrapper.className = 'select';
		this.dropdown.className = 'select__dropdown';

		this.wrapper.append(this.input);
		this.wrapper.append(this.dropdown);

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

		if (this.original.selectedOptions.length) {
			this.input.value = this.original.selectedOptions[0].label;
		}
	}

	update() {
		if (this.focus !== -1 && this.dropdown.children.length) {
			Array.from(this.dropdown.children).forEach((li, i) => {
				li.classList.toggle('select--has-focus', i === this.focus);
			});
			this.wrapper.setAttribute('aria-expanded', 'true');
			this.input.setAttribute('aria-activedescendant', this.id + '_option_' + this.indexMap[this.focus]);
		} else {
			this.wrapper.setAttribute('aria-expanded', 'false');
			this.input.setAttribute('aria-activedescendant', '');
		}
	}

	open() {
		var q = this.input.value.toLowerCase();
		this.focus = 0;
		this.dropdown.innerHTML = '';
		this.indexMap = [];
		Array.from(this.original.options).forEach((op, i) => {
			if (op.label.toLowerCase().indexOf(q) !== -1) {
				var li = document.createElement('li');
				li.id = this.id + '_option_' + i;
				li.textContent = op.label;
				li.onclick = () => {
					this.setValue(i);
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

	setValue(i) {
		this.input.value = this.original.options[i].label;
		this.input.setCustomValidity('');
		this.original.options[i].selected = true;
		this.original.dispatchEvent(new Event('change'));
		this.close();
		this.update();
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
	}

	oninput(event) {
		this.open();
	}

	onblur(event) {
		if (event.relatedTarget !== this.dropdown) {
			if (this.indexMap.length) {
				this.setValue(this.indexMap[this.focus]);
			}
			if (this.input.value === this.original.selectedOptions[0].label) {
				this.input.setCustomValidity('');
			} else {
				this.input.setCustomValidity('invalid choice');
			}
			this.close();
		}
	}
}

new Select('id_select', document.querySelector('select'));
