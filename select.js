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

		this.createElements();
		original.hidden = true;
		original.after(this.wrapper);
	}

	forOption(fn) {
		Array.from(this.original.options).forEach(fn);
	}

	focussed() {
		return this.ul.children[this.focus];
	}

	createElements() {
		this.wrapper = document.createElement('div');
		this.input = document.createElement('input');
		this.ul = document.createElement('ul');

		this.wrapper.className = 'select';
		this.wrapper.append(this.input);
		this.wrapper.append(this.ul);

		this.wrapper.setAttribute('aria-expanded', 'false');
		this.wrapper.setAttribute('aria-has-popup', 'listbox');
		this.input.setAttribute('aria-autocomplete', 'list');
		this.input.setAttribute('aria-activedescendant', 'TODO');
		this.ul.setAttribute('role', 'listbox');
		this.ul.setAttribute('aria-labelledby', 'TODO');
		this.ul.tabIndex = -1;

		this.input.onkeydown = this.onkeydown.bind(this);
		this.input.oninput = this.oninput.bind(this);
		this.input.onblur = this.onblur.bind(this);
		this.input.onclick = () => {
			this.focus = this.focus === -1 ? 0 : -1;
			this.update();
		};

		this.forOption((op, i) => {
			var li = document.createElement('li');
			li.id = this.id + '_option_' + i;
			li.textContent = op.label;
			li.onclick = () => {
				this.setValue(i);
				this.input.focus();
			}
			this.ul.append(li);
		});
	}

	update() {
		var q = this.input.value.toLowerCase();
		this.forOption((op, i) => {
			var li = this.ul.children[i];
			li.hidden = this.input.value && li.textContent.toLowerCase().indexOf(q) === -1;
			li.classList.remove('select--has-focus');
		});

		if (this.focus !== -1) {
			if (this.focussed().hidden) {
				this.focus = 0;
				while (this.focussed() && this.focussed().hidden) {
					this.focus += 1;
				}
			}
			if (this.focussed()) {
				this.focussed().classList.add('select--has-focus');
				this.focussed().scrollIntoView({block: 'nearest'});
			}
		}

		this.wrapper.setAttribute('aria-expanded', this.focus !== -1);
		if (this.focussed()) {
			this.input.setAttribute('aria-activedescendant', this.id + '_option_' + this.focus);
		} else {
			this.input.setAttribute('aria-activedescendant', '');
		}
	}

	moveFocus(k) {
		var step = 1;
		if (k < 0) {
			k = -k;
			step = -1;
		}

		var focus = this.focus;
		var li;
		for (var i = 0; i < k; i++) {
			focus += step;
			li = this.ul.children[focus];
			while (li && li.hidden) {
				focus += step;
				li = this.ul.children[focus];
			}
			if (li) {
				this.focus = focus;
			}
		}
		this.update();
	}

	setValue(i) {
		this.input.value = this.ul.children[i].textContent;
		this.input.setCustomValidity('');
		this.original.options[i].selected = true;
		this.original.dispatchEvent(new Event('change'));
		this.focus = -1;
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
				this.setValue(this.focus);
			} else if (
				event.keyCode === KEYS.ESC
				|| event.keyCode === KEYS.LEFT
				|| event.keyCode === KEYS.RIGHT
			) {
				this.focus = -1;
				this.update();
			}
		} else {
			if (event.keyCode === KEYS.DOWN) {
				event.preventDefault();
				this.focus = 0;
				this.update();
			}
		}
	}

	oninput(event) {
		this.focus = 0;
		this.update();
	}

	onblur(event) {
		if (event.relatedTarget !== this.ul) {
			if (this.focussed()) {
				this.setValue(this.focus);
			}

			if (this.input.value === this.original.selectedOptions[0].label) {
				this.input.setCustomValidity('');
			} else {
				this.input.setCustomValidity('invalid choice');
			}
		}
	}
}

new Select('id_select', document.querySelector('select'));
