/**
CREATE TABLE categories(
	id INTEGER PRIMARY KEY,
	name TEXT UNIQUE
);

CREATE TABLE "companies" (
	`id`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL,
	`description`	TEXT,
	`privacy_url`	TEXT,
	`website_url`	TEXT,
	`ghostery_id`	TEXT
);

CREATE TABLE tracker_domains(
	tracker TEXT NOT NULL,
	domain TEXT UNIQUE NOT NULL,
	FOREIGN KEY(tracker) REFERENCES trackers(id)
);

CREATE TABLE "trackers" (
	`id`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL,
	`category_id`	INTEGER,
	`website_url`	TEXT,
	`company_id`	TEXT,
	`ghostery_id`	TEXT,
	`notes`	TEXT,
	FOREIGN KEY(`category_id`) REFERENCES `categories`(`id`),
	FOREIGN KEY(`company_id`) REFERENCES `companies`(`id`)
);
*/

const Q_CROSS_REFERENCE = `
SELECT *
FROM tracker_domains
	JOIN trackers ON tracker_domains.tracker = trackers.id
	JOIN companies ON trackers.company_id = companies.id
	JOIN categories ON trackers.category_id = categories.id

WHERE domain=$domain
`

function loadDB() {
	const db = new SQL.Database();
	const request = new Request('data/trackerdb.sql')

	return fetch(request)
	.then(response => response.text())
	.then(text => {db.exec(text); return db})
}

function crossReference(db, domains) {
	const companies = {}

	Object.keys(domains).forEach(function(domain) {
		const stmt = db.prepare(Q_CROSS_REFERENCE);
		const details = stmt.getAsObject({$domain: domain});
		const company = details.company_id

		if (company) {
			if (!companies[company]) {
				companies[company] = {
					domains: []
				}
			}

			companies[company].details = details
			companies[company].domains.push(domains[domain])
		}
	})

	return companies
}
