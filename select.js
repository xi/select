var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var KEYS = {
	BACKSPACE: 8,
	ENTER: 13,
	ESC: 27,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	UP: 38,
	DOWN: 40,
};

var randomString = function(length) {
	var result = [];
	for (var i = 0; i < length; i++) {
		var k = Math.floor(Math.random() * chars.length);
		result.push(chars[k]);
	}
	return result.join('');
};

var create = function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.children[0];
};

export class Select {
	constructor(id, original) {
		this.id = id;
		this.original = original;
		this.focus = -1;
		this.indexMap = [];

		this.createElements();
		original.hidden = true;
		original.before(this.wrapper);
	}

	createElements() {
		this.wrapper = create('<div class="select" role="combobox" aria-expanded="false" aria-has-popup="listbox">');
		this.input = create('<input aria-autocomplete="list" autocomplete="off">');
		this.dropdown = create('<ul class="select__dropdown" role="listbox" tabindex="-1">');

		if (this.original.multiple) {
			var inputWrapper = create('<div class="select__input">');
			this.values = create('<ul class="select__values" aria-live="polite">')
			inputWrapper.append(this.values);
			inputWrapper.append(this.input);
			this.wrapper.append(inputWrapper);
		} else {
			this.wrapper.append(this.input);
		}

		this.wrapper.append(this.dropdown);

		this.input.className = this.original.dataset.selectInputClass || '';
		this.input.disabled = this.original.disabled;
		// this.dropdown.setAttribute('aria-labelledby', 'TODO');

		this.input.onkeydown = this.onkeydown.bind(this);
		this.input.oninput = this.oninput.bind(this);
		this.input.onblur = this.onblur.bind(this);
		this.input.onclick = () => {
			if (this.focus === -1) {
				this.open(true);
			} else {
				this.close();
			}
		};

		// Prevent blurring input. This also ensures dragging the cursor away from
		// the list item will cancel the selection
		this.dropdown.onmousedown = event => {
			event.preventDefault();
		};

		this.updateValue();
	}

	isMatch(s) {
		var q = this.input.value.toLowerCase();
		return s.toLowerCase().indexOf(q) !== -1;
	}

	update() {
		var options = this.dropdown.querySelectorAll('[role="option"]');
		if (this.focus !== -1 && options.length) {
			Array.from(options).forEach((li, i) => {
				var op = this.original.options[this.indexMap[i]];
				li.classList.toggle('select--has-focus', i === this.focus);
				li.classList.toggle('select--selected', this.original.multiple && op.selected);
				li.setAttribute('aria-selected', op.selected);
			});
			this.wrapper.setAttribute('aria-expanded', 'true');
			this.input.setAttribute('aria-activedescendant', this.id + '_option_' + this.indexMap[this.focus]);
			options[this.focus].scrollIntoView({block: 'nearest'});
		} else {
			this.wrapper.setAttribute('aria-expanded', 'false');
			this.input.setAttribute('aria-activedescendant', '');
		}
	}

	updateValue() {
		if (this.original.multiple) {
			this.input.value = '';
			this.input.setCustomValidity('');
			this.values.innerHTML = '';
			Array.from(this.original.options).forEach((op, i) => {
				if (op.selected && op.label) {
					var li = create('<li>');
					li.textContent = op.label;
					li.className = this.original.dataset.selectValueClass || 'select__value';
					li.onclick = () => {
						this.original.options[i].selected = false;
						li.remove();
						this.input.focus();
					};
					this.values.append(li);
				}
			});
		} else {
			if (this.original.selectedOptions.length) {
				this.input.value = this.original.selectedOptions[0].label;
				this.input.setCustomValidity('');
			}
		}
	}

	createOption(op, i) {
		var li = create('<li role="option">');
		li.id = this.id + '_option_' + i;
		li.textContent = op.label;
		if (op.disabled) {
			li.setAttribute('aria-disabled', 'true');
		} else {
			li.onclick = () => {
				this.setValue(i, this.original.multiple);
				this.input.focus();
			};
		}
		this.indexMap.push(i);
		return li;
	}

	open(forceAll) {
		this.focus = 0;
		this.dropdown.innerHTML = '';
		this.indexMap = [];
		var i = 0;
		Array.from(this.original.children).forEach(child => {
			if (child.tagName === 'OPTION') {
				if (child.label && (forceAll || this.isMatch(child.label))) {
					this.dropdown.append(this.createOption(child, i));
				}
				i += 1;
			} else {
				var group = create('<li role="group">');
				var label = create('<strong>');
				var ul = create('<ul role="none">');
				label.textContent = child.label;
				group.append(label);
				group.append(ul);
				Array.from(child.children).forEach(c => {
					if (c.label && (forceAll || this.isMatch(c.label))) {
						ul.append(this.createOption(c, i));
					}
					i += 1;
				});
				if (ul.children.length) {
					this.dropdown.append(group);
				}
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
		this.focus = Math.min(this.focus, this.indexMap.length - 1);
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
			} else if (event.keyCode === KEYS.ESC) {
				this.input.value = '';
				this.close();
			}
		} else {
			if (event.keyCode === KEYS.DOWN) {
				event.preventDefault();
				this.open(true);
			}
		}
		if (this.original.multiple && !this.input.value && event.keyCode === KEYS.BACKSPACE) {
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
		if (this.input.value) {
			this.open(false);
		} else {
			this.close();
		}
		if (Array.from(this.original.options).some(op => this.isMatch(op.label))) {
			this.input.setCustomValidity('');
		} else {
			this.input.setCustomValidity('invalid choice');
		}
	}

	onblur(event) {
		if (!this.input.value) {
			if (!this.original.multiple) {
				this.original.value = '';
			}
			this.close();
		} else if (this.indexMap.length) {
			this.setValue(this.indexMap[this.focus]);
		}
		if (!this.original.checkValidity()) {
			this.input.setCustomValidity(this.original.validationMessage);
		}
	}
}

Array.from(document.querySelectorAll('[data-select]')).forEach(el => {
	new Select(randomString(8), el);
});
