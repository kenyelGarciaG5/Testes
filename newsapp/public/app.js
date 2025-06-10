async function fetchNews() {
  const res = await fetch('/news');
  const data = await res.json();
  const newsSection = document.getElementById('news');
  data.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'article';
    const img = item.image ? `<img src="${item.image}" alt="imagem da notícia">` : '';
    div.innerHTML = `<h3><a href="${item.link}" target="_blank">${item.title}</a></h3>${img}<p>${item.content}</p>`;
    newsSection.appendChild(div);
  });
}

async function loadFigures() {
  const res = await fetch('figures.json');
  const figures = await res.json();
  const section = document.getElementById('public-figures');
  figures.forEach(fig => {
    const div = document.createElement('div');
    div.className = 'figure';
    div.innerHTML = `<img src="${fig.image}" alt="${fig.name}"><div><strong>${fig.name}</strong><div class="credit">Crédito: ${fig.credit}</div></div>`;
    section.appendChild(div);
  });
}

fetchNews();
loadFigures();
