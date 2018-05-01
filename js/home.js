function t_group(group) {
	var cookies = ''

	for (var i = 0; i < group.cookies.length; i++) {
		cookies += `<li>${t_cookie(group.cookies[i])}</li>`
	}

	return `<div>
			<h2>${e(group.domain)}</h2>
			<ul>${cookies}</ul>
		</div>`
}

function t_cookie(cookie) {
	var expiration = new Date(parseInt(cookie.expirationDate, 10) * 1000);
	return `${e(cookie.name)}: ${e(cookie.value)} (exp: ${expiration.toString()})`
}

function normalizeDomain(domain) {
	domain = domain.toLowerCase()
	if (domain[0] === '.') {
		domain = domain.substring(1)
	}
	return domain
}

function groupCookies(cookies) {
	const groups = {}

	for (var i = 0; i < cookies.length; i++) {
		const cookie = cookies[i]
		const domain = normalizeDomain(cookie.domain)

		if (!groups[domain]) {
			groups[domain] = {
				domain: domain,
				cookies: []
			}
		}

		groups[domain].cookies.push(cookie)
	}
	return groups
}

chrome.cookies.getAll({}, cookies => {
	const groups = groupCookies(cookies)
	console.log(groups)
	const main = document.getElementById('main')
	const ul = document.createElement('ul')
	main.appendChild(ul)

	Object.keys(groups).forEach(function(domain) {
		const group = groups[domain]
		const li = document.createElement('li')
		li.innerHTML = t_group(group)
		ul.appendChild(li)
	})
});

