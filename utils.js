var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export var KEYS = {
	BACKSPACE: 8,
	ENTER: 13,
	ESC: 27,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	UP: 38,
	DOWN: 40,
};

export var randomString = function(length) {
	var result = [];
	for (var i = 0; i < length; i++) {
		var k = Math.floor(Math.random() * chars.length);
		result.push(chars[k]);
	}
	return result.join('');
};

export var create = function(html) {
	var tmp = document.createElement('template');
	tmp.innerHTML = html;
	return tmp.content.children[0];
};
