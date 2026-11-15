const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(length) {
	const result = [];
	for (let i = 0; i < length; i++) {
		const k = Math.floor(Math.random() * chars.length);
		result.push(chars[k]);
	}
	return result.join('');
}

export function create(html) {
	const tmp = document.createElement('template');
	tmp.innerHTML = html;
	return tmp.content.children[0];
}
