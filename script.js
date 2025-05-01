let poems = [];
let lastIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('anotherBtn').addEventListener('click', showRandomPoem);
});

async function fetchPoemsData(feeling) {
  const url = `https://poetrydb.org/lines/${encodeURIComponent(feeling)}/author,title,lines,linecount.json`;
  const poemSection = document.getElementById('poemSection');
  const anotherBtn = document.getElementById('anotherBtn');

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.status === 404 || !data.length) {
      poemSection.innerHTML = `<p>No poems found for "${feeling}". Try another word!</p>`;
      anotherBtn.style.display = 'none';
      return;
    }

    poems = data;
    lastIndex = -1;
    showRandomPoem();
    anotherBtn.style.display = 'inline-block';

  } catch (error) {
    console.error('Fetch error:', error);
    poemSection.innerHTML = `<p>Error fetching poems. Please try again later.</p>`;
  }
}

function handleSearch() {
  const feeling = document.getElementById('feelingInput').value.trim();
  if (!feeling) {
    alert("Please enter a feeling or word.");
    return;
  }
  fetchPoemsData(feeling);
}

function showRandomPoem() {
  const poemSection = document.getElementById('poemSection');
  if (!poems.length) return;

  let index;
  do {
    index = Math.floor(Math.random() * poems.length);
  } while (index === lastIndex && poems.length > 1);

  lastIndex = index;
  const poem = poems[index];

  poemSection.innerHTML = `
    <div class="poem">
      <div class="title">${poem.title}</div>
      <div class="author">by ${poem.author} (${poem.linecount} lines)</div>
      <div class="lines">${poem.lines.join('<br>')}</div>
    </div>
  `;
}
