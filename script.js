// FULL SCRIPT WITH TYPING SOUND + BG MUSIC

let poems = [];
let lastIndex = -1;

const typeAudio = document.getElementById('typeSound');
const bgAudio = document.getElementById('bgSound');
const bgAudioIndex = document.getElementById('bgSoundIndex');

// INDEX PAGE FUNCTION
function startSearch() {
  const feeling = document.getElementById('feelingInput').value.trim();
  if (!feeling) {
    alert("Please enter a feeling or phrase.");
    return;
  }
  localStorage.setItem('feeling', feeling);
  window.location.href = 'poems.html';
}

// RESULT PAGE
document.addEventListener('DOMContentLoaded', () => {
  const bgAudio = document.getElementById('bgSound');

  if (bgAudio) {
    bgAudio.volume = 0.3;
    bgAudio.loop = true;
    bgAudio.currentTime = 0;

    const playAttempt = bgAudio.play();
    if (playAttempt && playAttempt.catch) {
      playAttempt.catch(() => {
        const unlock = () => {
          bgAudio.play().catch(err =>
            console.warn('🔇 Still blocked after interaction:', err)
          );
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
      });
    }
  }

  const resultDiv = document.getElementById('poemResult');
  if (!resultDiv) return;

  const feeling = localStorage.getItem('feeling');
  if (!feeling) {
    resultDiv.innerHTML = '<p>No feeling provided. <a href="index.html">Go back</a>.</p>';
    return;
  }

  document.getElementById('wordDisplay').textContent = feeling;
  fetchPoemsData(feeling);
});


// FETCH RANDOM POEMS UNTIL ONE MATCHES
async function fetchPoemsData(feeling) {
  const words = feeling.toLowerCase().split(/\s+/);
  const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'i');

  let found = false;
  let tries = 0;

  while (!found && tries < 20) {
    tries++;
    try {
      const res = await fetch('https://poetrydb.org/random/1/author,title,lines,linecount.json');
      const data = await res.json();
      const poem = data[0];

      for (let i = 0; i < poem.lines.length; i++) {
        if (regex.test(poem.lines[i])) {
          const cluster = poem.lines.slice(i, i + 4);
          poems = [poem];
          lastIndex = 0;

          displayTypedPoem([
            `${poem.title}`,
            `by ${poem.author}`,
            ...cluster
          ], false);
          found = true;
          break;
        }
      }
    } catch (err) {
      console.error('Error fetching poem:', err);
      break;
    }
  }

  if (!found) {
    document.getElementById('poemResult').innerHTML =
      `<p>Couldn't find a match for "${feeling}". Try a different word.</p>`;
  }
}

// TYPING ANIM
function showFullPoem() {
  if (!poems.length || lastIndex === -1) return;
  const poem = poems[lastIndex];

  const container = document.getElementById('poemResult');
  container.innerHTML = '';
  container.style.maxHeight = '60vh';
  container.style.overflowY = 'auto';

  displayTypedPoem([
    `${poem.title}`,
    `by ${poem.author} (${poem.linecount} lines)`,
    ...poem.lines
  ], true);
}

// SHOW NEXT OR ANOTHER ONE
function showAnotherPoem() {
  const feeling = localStorage.getItem('feeling');
  if (feeling) fetchPoemsData(feeling);
}

// BACK TO INDEX
function goBack() {
  localStorage.removeItem('feeling');
  window.location.href = 'index.html';
}

// DISPLAY TYPED POEM
function displayTypedPoem(lines, isFast = false, callback = null) {
  const container = document.getElementById('poemResult');
  container.innerHTML = '';
  typePoemLines(lines, container, isFast, callback);
}

// PLAY/STOP SOUND
function playTypingSound() {
  typeAudio.currentTime = 15;
  typeAudio.loop = true;
  typeAudio.volume = 0.7;
  typeAudio.play().catch(err => console.warn('❌ Typing sound error', err));
}

function stopTypingSound() {
  typeAudio.pause();
  typeAudio.currentTime = 15;
}

// TYPING LOGIC
function typePoemLines(lines, container, isFast = false, callback = null) {
  let i = 0;
  const lineContainer = document.createElement('div');
  container.appendChild(lineContainer);

  playTypingSound();

  function typeNextLine() {
    if (i >= lines.length) {
      stopTypingSound();
      if (callback) callback();
      return;
    }

    const line = document.createElement('div');
    if (i === 0) {
      line.style.fontWeight = 'bold';
      line.style.fontSize = '1.6rem';
      line.style.marginBottom = '0.4em';
    } else if (i === 1) {
      line.style.fontStyle = 'italic';
      line.style.marginBottom = '1.2em';
    }

    lineContainer.appendChild(line);

    const words = lines[i].split(' ');
    let wordIndex = 0;

    function typeWord() {
      if (wordIndex >= words.length) {
        i++;
        const linePause = isFast ? 150 : Math.floor(Math.random() * 800) + 1000;
        setTimeout(typeNextLine, linePause);
        return;
      }

      const word = words[wordIndex];
      let charIndex = 0;
      const typedWord = document.createElement('span');
      line.appendChild(typedWord);

      function typeChar() {
        if (charIndex < word.length) {
          typedWord.textContent += word.charAt(charIndex);
          charIndex++;

          const charDelay = isFast ? 10 : Math.floor(Math.random() * 50) + 100;
          setTimeout(typeChar, charDelay);
        } else {
          line.append(' ');
          wordIndex++;

          const wordPause = isFast ? 50 : Math.floor(Math.random() * 400) + 250;
          setTimeout(typeWord, wordPause);
        }
      }

      typeChar();
    }

    typeWord();
  }

  typeNextLine();
}