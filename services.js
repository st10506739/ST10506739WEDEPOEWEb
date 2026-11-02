var PROGRAMMES = [
  { title: 'Career readiness and employability training', pathway: 'employment', format: 'Training',
    summary: 'Build the confidence, habits and workplace know-how that employers look for in a first job or a career move.' },
  { title: 'CV development and interview preparation', pathway: 'employment', format: 'Coaching',
    summary: 'Turn your education and experience into a clear CV, then practise answering interview questions with feedback.' },
  { title: 'Workplace communication and professional etiquette', pathway: 'employment', format: 'Training',
    summary: 'Learn how to write professional emails, speak up in meetings and handle everyday workplace situations.' },
  { title: 'Digital and future-ready skills', pathway: 'employment', format: 'Training',
    summary: 'Get comfortable with the digital tools and ways of working that modern workplaces expect.' },
  { title: 'Career mentorship and networking', pathway: 'employment', format: 'Mentorship',
    summary: 'Be paired with people who have walked the path, and meet professionals who can open doors.' },
  { title: 'Entrepreneurial mindset development', pathway: 'business', format: 'Training',
    summary: 'Develop the resilience, initiative and problem-solving approach that business owners rely on.' },
  { title: 'Business planning and enterprise development', pathway: 'business', format: 'Workshop',
    summary: 'Shape an idea into a workable plan, from your customers and offer to how the business will earn.' },
  { title: 'Financial literacy and business management', pathway: 'business', format: 'Training',
    summary: 'Understand budgeting, pricing, cash flow and the everyday management of a small enterprise.' },
  { title: 'Business mentorship and coaching', pathway: 'business', format: 'Mentorship',
    summary: 'Work with an experienced entrepreneur who coaches you through the early decisions.' },
  { title: 'Innovation, networking and market access', pathway: 'business', format: 'Networking',
    summary: 'Meet partners, peers and potential customers, and learn how to bring your product to market.' }
];

var PATHWAY_LABEL = { employment: 'Employment pathway', business: 'Entrepreneurship pathway' };

document.addEventListener('DOMContentLoaded', function () {
  var list = document.getElementById('programme-list');
  if (!list) return;
  var search = document.getElementById('programme-search');
  var filter = document.getElementById('programme-filter');
  var sort = document.getElementById('programme-sort');
  var count = document.getElementById('result-count');

    function update() {
    var term = search.value.trim().toLowerCase();
    var results = PROGRAMMES.filter(function (p) {
      var matchesText = (p.title + ' ' + p.summary + ' ' + p.format).toLowerCase().indexOf(term) !== -1;
      var matchesPath = filter.value === 'all' || p.pathway === filter.value;
      return matchesText && matchesPath;
    });

    results.sort(function (a, b) {
      if (sort.value === 'za') return b.title.localeCompare(a.title);
      if (sort.value === 'pathway') return a.pathway.localeCompare(b.pathway) || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
    render(results);
  }

    function render(items) {
    list.textContent = '';
    count.textContent = items.length === 1 ? '1 programme found' : items.length + ' programmes found';

    if (items.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No programmes match your search. Clear the search box or choose "All pathways" to see everything.';
      list.appendChild(empty);
      return;
    }
    items.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'programme';

      var text = document.createElement('div');
      var h3 = document.createElement('h3');
      h3.textContent = p.title;
      var meta = document.createElement('p');
      meta.textContent = p.summary;
      var fmt = document.createElement('p');
      fmt.className = 'hint';
      fmt.textContent = 'Format: ' + p.format;
      text.append(h3, meta, fmt);

      var tag = document.createElement('span');
      tag.className = 'tag' + (p.pathway === 'business' ? ' tag--business' : '');
      tag.textContent = PATHWAY_LABEL[p.pathway];

      li.append(text, tag);
      list.appendChild(li);
    });
  }

  search.addEventListener('input', update);
  filter.addEventListener('change', update);
  sort.addEventListener('change', update);
  update();
});
