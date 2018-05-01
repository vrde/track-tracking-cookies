function t_company(company) {
	var domains = ''

	for (var i = 0; i < company.domains.length; i++) {
		domains += `<li>${t_domain(company.domains[i])}</li>`
	}

	return `<div>
			<h1>${e(company.details.company_id)}: ${e(company.details.name)}</h1>
			<a href="${e(company.details.privacy_url)}">privacy page</a>
			<ul>${domains}</ul>
		</div>`
}

function t_domain(domain) {
	var cookies = ''

	for (var i = 0; i < domain.cookies.length; i++) {
		cookies += `<li>${t_cookie(domain.cookies[i])}</li>`
	}

	return `<div>
			<h2>${e(domain.domain)}</h2>
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

function renderCookies(companies) {
	const main = document.getElementById('main')
	const ul = document.createElement('ul')
	main.appendChild(ul)

	Object.keys(companies).forEach(function(company) {
		const data = companies[company]
		console.log(data)
		const li = document.createElement('li')
		li.innerHTML = t_company(data)
		ul.appendChild(li)
	})
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

function boot() {
	loadDB().then(db => {
		console.log('Ready to eat all your cookies!')
		chrome.cookies.getAll({}, cookies => {
			const domains = groupCookies(cookies)
			const companies = crossReference(db, domains)
			console.log(companies)
			renderCookies(companies)
		})
	})
}

boot()
