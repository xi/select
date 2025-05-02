import { KEYS, randomString, create } from './utils.js';
import { Values } from './values.js';

export class Select {
	constructor(original, options = {}) {
		this.original = original;

		this.id = options.id || randomString(8);
		this.inputClass = options.inputClass || original.dataset.selectInputClass;
		this.valueClass = options.valueClass || original.dataset.selectValueClass;

		this.focus = -1;
		this.indexMap = [];
		this.inputDirty = false;

		this.createElements();
		original.hidden = true;
		original.before(this.wrapper);

		this.updateInput();
	}

	createElements() {
		this.wrapper = create('<div class="select">');
		this.input = create('<input role="combobox" aria-expanded="false" aria-has-popup="listbox" aria-autocomplete="list" autocomplete="off">');
		this.dropdown = create('<ul class="select__dropdown" role="listbox" tabindex="-1">');

		if (this.original.multiple) {
			var inputWrapper = create('<div class="select__input">');
			inputWrapper.append(this.input);
			this.values = new Values(this.input, `${this.id}-values`, this.valueClass);
			this.wrapper.append(inputWrapper);
		} else {
			this.wrapper.append(this.input);
		}

		this.wrapper.append(this.dropdown);

		this.input.className = this.inputClass || '';
		this.input.disabled = this.original.disabled;

		var labels = Array.from(this.original.labels).map(label => {
			label.id = label.id || randomString(8);
			return label.id;
		}).join(' ');
		this.input.setAttribute('aria-labelledby', labels);
		this.dropdown.setAttribute('aria-labelledby', labels);

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

		this.original.oninvalid = () => {
			this.updateValidity();
			this.input.reportValidity();
		};
		this.original.onchange = () => {
			this.updateValidity();
		};

		// Prevent blurring input. This also ensures dragging the cursor away from
		// the list item will cancel the selection
		this.dropdown.onmousedown = event => {
			event.preventDefault();
		};
	}

	isMatch(s) {
		var q = this.input.value.toLowerCase();
		return s.toLowerCase().indexOf(q) !== -1;
	}

	updateDropdown() {
		var options = this.dropdown.querySelectorAll('[role="option"]');
		if (this.focus !== -1 && options.length) {
			Array.from(options).forEach((li, i) => {
				var op = this.original.options[this.indexMap[i]];
				li.classList.toggle('select--has-focus', i === this.focus);
				li.classList.toggle('select--selected', this.original.multiple && op.selected);
				li.setAttribute('aria-selected', op.selected);
			});
			this.wrapper.setAttribute('aria-expanded', 'true');
			this.input.setAttribute('aria-activedescendant', `${this.id}_option_${this.indexMap[this.focus]}`);
			options[this.focus].scrollIntoView({block: 'nearest'});
		} else {
			this.wrapper.setAttribute('aria-expanded', 'false');
			this.input.setAttribute('aria-activedescendant', '');
		}
	}

	updateInput() {
		if (this.original.multiple) {
			this.input.value = '';
			this.inputDirty = false;
			this.updateValidity();
			this.values.update(this.original, () => {
				this.updateInput();
				this.input.focus();
			});
		} else {
			if (this.original.selectedOptions.length) {
				this.input.value = this.original.selectedOptions[0].label;
				this.inputDirty = false;
				this.updateValidity();
			}
		}
	}

	updateValidity() {
		if (this.inputDirty) {
			this.input.setCustomValidity('invalid choice');
		} else {
			this.input.setCustomValidity(this.original.validationMessage);
		}
	}

	createOption(op, i) {
		var li = create('<li role="option">');
		li.id = `${this.id}_option_${i}`;
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
		this.updateDropdown();
	}

	close() {
		this.focus = -1;
		this.dropdown.innerHTML = '';
		this.indexMap = [];
		this.updateDropdown();
	}

	moveFocus(k) {
		this.focus += k;
		this.focus = Math.max(this.focus, 0);
		this.focus = Math.min(this.focus, this.indexMap.length - 1);
		this.updateDropdown();
	}

	setValue(i, toggle) {
		if (toggle) {
			this.original.options[i].selected = !this.original.options[i].selected;
		} else {
			this.original.options[i].selected = true;
		}
		this.original.dispatchEvent(new Event('change'));
		this.close();
		this.updateDropdown();
		this.updateInput();
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
				if (this.indexMap.length) {
					event.preventDefault();
					this.setValue(this.indexMap[this.focus]);
				}
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
				this.updateInput();
				this.input.value = op.label;
				this.input.dispatchEvent(new Event('input'));
			}
		}
	}

	oninput(event) {
		if (this.input.value) {
			this.open(false);
		} else {
			this.close();
		}
		var ops = Array.from(this.original.options);
		this.inputDirty = !ops.some(op => this.isMatch(op.label));
		this.updateValidity();
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
	}
}

Array.from(document.querySelectorAll('[data-select]')).forEach(el => {
	new Select(el);
});
