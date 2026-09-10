/**
 * Annual filings - financial year picker and document list.
 *
 * ADDING A NEW FINANCIAL YEAR
 * ---------------------------
 *   1. Create documents/annual-filings/<FY>/   e.g. documents/annual-filings/2025-26/
 *   2. Drop the PDFs in, named exactly as listed in DEFAULT_DOCUMENTS below.
 *
 * That is the whole job. The year shows up in the dropdown on its own and
 * this file never needs editing. Only files that actually exist get listed,
 * so a part-filed year (say, the auditor's report alone) works fine too.
 *
 * Need a document that is not one of the four defaults? Add an index.json to
 * that year's folder and it replaces the default list for that year only:
 *   [ { "file": "form-mgt-7.pdf", "title": "Form MGT-7 (Annual Return)" } ]
 */

document.addEventListener('DOMContentLoaded', function () {
	var BASE_PATH = 'documents/annual-filings';
	var FIRST_FY_START = 2024; // FY 2024-25 is the company's first filed year

	// Listed in this order on the page. Each file name is just its title in
	// lower case, hyphenated, with the apostrophe dropped.
	var DEFAULT_DOCUMENTS = [
		{ file: 'annual-report.pdf', title: 'Annual Report' },
		{ file: 'directors-report.pdf', title: 'Director’s Report' },
		{ file: 'audit-report.pdf', title: 'Audit Report' },
		{ file: 'financial-statement.pdf', title: 'Financial Statement' }
	];

	var filterEl = document.getElementById('filing-filter');
	var selectEl = document.getElementById('filing-year');
	var listEl = document.getElementById('filing-list');
	var statusEl = document.getElementById('filing-status');
	if (!filterEl || !selectEl || !listEl || !statusEl) return;

	if (window.location.protocol === 'file:') {
		setStatus('The filings list needs the site to be served over http. Run <code>npx serve</code> (or use Prepros / Live Server) and open it from there.');
		return;
	}

	// --- helpers ---------------------------------------------------------

	function esc(str) {
		return String(str).replace(/[&<>"']/g, function (ch) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
		});
	}

	function setStatus(html) {
		statusEl.innerHTML = html;
		statusEl.hidden = !html;
	}

	// "2024-25" from 2024.
	function fyLabel(startYear) {
		return startYear + '-' + String(startYear + 1).slice(-2);
	}

	// Indian financial years start on 1 April, so Jan-Mar still belongs to
	// the year that began the previous April.
	function currentFyStart() {
		var now = new Date();
		return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
	}

	function candidateYears() {
		var years = [];
		for (var start = currentFyStart(); start >= FIRST_FY_START; start--) {
			years.push(fyLabel(start));
		}
		return years; // newest first
	}

	function formatSize(bytes) {
		if (!bytes) return 'PDF';
		var mb = bytes / (1024 * 1024);
		if (mb >= 1) return 'PDF · ' + mb.toFixed(1) + ' MB';
		return 'PDF · ' + Math.max(1, Math.round(bytes / 1024)) + ' KB';
	}

	// --- discovery -------------------------------------------------------

	// A missing file 404s, which resolves with ok === false; a network error
	// rejects. Either way the document is simply left out of the list.
	function probe(year, doc) {
		var url = BASE_PATH + '/' + year + '/' + doc.file;
		return fetch(url, { method: 'HEAD' })
			.then(function (res) {
				if (!res.ok) return null;
				var length = parseInt(res.headers.get('content-length'), 10);
				return {
					title: doc.title,
					url: url,
					size: isFinite(length) ? length : null
				};
			})
			.catch(function () { return null; });
	}

	function documentsFor(year) {
		return fetch(BASE_PATH + '/' + year + '/index.json')
			.then(function (res) { return res.ok ? res.json() : null; })
			.then(function (list) {
				if (!Array.isArray(list)) return DEFAULT_DOCUMENTS;
				var valid = list.filter(function (doc) {
					return doc && typeof doc.file === 'string' && typeof doc.title === 'string';
				});
				return valid.length ? valid : DEFAULT_DOCUMENTS;
			})
			.catch(function () { return DEFAULT_DOCUMENTS; });
	}

	function loadYear(year) {
		return documentsFor(year)
			.then(function (docs) {
				return Promise.all(docs.map(function (doc) { return probe(year, doc); }));
			})
			.then(function (results) {
				return { year: year, documents: results.filter(Boolean) };
			});
	}

	// --- rendering -------------------------------------------------------

	function renderDocuments(entry) {
		listEl.innerHTML = entry.documents.map(function (doc) {
			var saveAs = 'Spillvoy Gaming - ' + doc.title + ' FY ' + entry.year + '.pdf';
			return '' +
				'<li class="filing-item">' +
					'<a class="filing-item-link" href="' + esc(doc.url) + '" target="_blank" rel="noopener noreferrer nofollow">' +
						'<span class="filing-item-icon icon-file-pdf-o" aria-hidden="true"></span>' +
						'<span class="filing-item-text">' +
							'<span class="filing-item-title">' + esc(doc.title) + '</span>' +
							'<span class="filing-item-meta">' + esc(formatSize(doc.size)) + '</span>' +
						'</span>' +
					'</a>' +
					'<a class="filing-item-download" href="' + esc(doc.url) + '" download="' + esc(saveAs) + '" rel="nofollow">' +
						'<span class="icon-download" aria-hidden="true"></span>Download' +
						'<span class="sr-only"> ' + esc(doc.title) + ' for FY ' + esc(entry.year) + '</span>' +
					'</a>' +
				'</li>';
		}).join('');
	}

	function fyFromHash() {
		var match = /(?:^|[#&])fy=(\d{4}-\d{2})/.exec(window.location.hash || '');
		return match ? match[1] : null;
	}

	function populate(years) {
		var byYear = {};
		years.forEach(function (entry) { byYear[entry.year] = entry; });

		selectEl.innerHTML = years.map(function (entry) {
			return '<option value="' + esc(entry.year) + '">FY ' + esc(entry.year) + '</option>';
		}).join('');

		function show(year) {
			var entry = byYear[year] || years[0];
			selectEl.value = entry.year;
			renderDocuments(entry);
			setStatus('');
		}

		selectEl.addEventListener('change', function () {
			// replaceState keeps the back button clean and fires no hashchange.
			window.history.replaceState(null, '', '#fy=' + selectEl.value);
			show(selectEl.value);
		});

		window.addEventListener('hashchange', function () {
			show(fyFromHash() || years[0].year);
		});

		show(fyFromHash() || years[0].year);
		filterEl.hidden = false;
	}

	// --- go --------------------------------------------------------------

	setStatus('Loading filings…');

	Promise.all(candidateYears().map(loadYear))
		.then(function (years) {
			var available = years.filter(function (entry) { return entry.documents.length > 0; });
			if (!available.length) {
				setStatus('No filings are published yet. Please check back later.');
				return;
			}
			populate(available);
		})
		.catch(function (err) {
			console.error('Error loading annual filings:', err);
			setStatus('The filings list could not be loaded. Please refresh, or email <a href="mailto:contact@spill.games">contact@spill.games</a>.');
		});
});
