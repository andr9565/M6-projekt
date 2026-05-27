import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBd3Gt34F1IvP-_Dv1lO7HGYRuek_dD7s0",
  authDomain: "m5-projekt.firebaseapp.com",
  databaseURL: "https://m5-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "m5-projekt",
  storageBucket: "m5-projekt.firebasestorage.app",
  messagingSenderId: "391585508161",
  appId: "1:391585508161:web:2ddb1af59a8e760438cfc0",
  measurementId: "G-EHDCTK3YHZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const publicPages = new Set(['login.html', 'register.html']);
const protectedPages = new Set(['index.html', 'koeb-boeger.html', 'saelg-boeger.html', 'min-bruger.html']);
const isLoggedIn = !!localStorage.getItem('loggedInUser');

if (protectedPages.has(currentPage) && !isLoggedIn) {
  window.location.replace('login.html');
} else if (publicPages.has(currentPage) && isLoggedIn) {
  window.location.replace('index.html');
}

function showStatus(message, color) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.color = color || '';
    return;
  }
  console.log(message);
}

function showSellDebug(message, color) {
  const debugEl = document.getElementById('sell-debug');
  if (debugEl) {
    debugEl.textContent = message;
    debugEl.style.color = color || '';
  }
  console.log(message);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderBooks(books) {
  const bookGrids = document.querySelectorAll('#book-grid');
  if (!bookGrids.length) return;

  const sortedBooks = Object.entries(books || {})
    .map(([id, book]) => ({ id, ...book }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const cardsHtml = sortedBooks.length
    ? sortedBooks.map((book) => {
        const price = book.price ? `${escapeHtml(book.price)} kr.` : 'Pris mangler';
        const condition = book.condition ? escapeHtml(book.condition) : 'Ukendt stand';
        const coverHtml = book.coverUrl
          ? `<img class="book-cover" src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title || 'Bog')}" />`
          : `<div class="book-cover book-cover-placeholder" aria-hidden="true">📚</div>`;

        return `
          <article class="book-card">
            ${coverHtml}
            <div class="book-body">
              <h3 class="book-title">${escapeHtml(book.title || 'Uden titel')}</h3>
              <p class="book-author">${escapeHtml(book.author || 'Ukendt forfatter')}</p>
              <div class="pill-row">
                <span class="pill">${condition}</span>
                <span class="pill">${escapeHtml(book.seller || 'Ukendt sælger')}</span>
              </div>
              <p class="seller">${escapeHtml(book.description || '')}</p>
              <div class="book-footer">
                <p class="price">${price}</p>
              </div>
            </div>
          </article>
        `;
      }).join('')
    : `<div class="book-card"><div class="book-body"><h3 class="book-title">Ingen bøger endnu</h3><p class="seller">Sæt den første bog til salg for at få den vist her.</p></div></div>`;

  bookGrids.forEach((grid) => {
    grid.innerHTML = cardsHtml;
  });
}

function setupBookFeed() {
  const booksRef = ref(database, 'books');
  onValue(
    booksRef,
    (snapshot) => {
      renderBooks(snapshot.val() || {});
    },
    (error) => {
      console.error('Kunne ikke hente bøger fra databasen', error);
      const bookGrids = document.querySelectorAll('#book-grid');
      bookGrids.forEach((grid) => {
        grid.innerHTML = '<div class="book-card"><div class="book-body"><h3 class="book-title">Kunne ikke hente bøger</h3><p class="seller">Tjek database-regler eller console for fejl.</p></div></div>';
      });
    }
  );
}

async function loadBooksViaRest() {
  const bookGrids = document.querySelectorAll('#book-grid');
  if (!bookGrids.length) return;

  try {
    const response = await fetch('https://m5-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const books = await response.json();
    renderBooks(books || {});
  } catch (error) {
    console.error('Kunne ikke hente bøger via REST', error);
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Kunne ikke læse billedfilen'));
    reader.readAsDataURL(file);
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      showStatus("Brugeren findes ikke", "#d93025");
      return;
    }

    const user = snapshot.val();

    if (user.password !== password) {
      showStatus("Forkert adgangskode", "#d93025");
      return;
    }

    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  });
}

// OPRET BRUGER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !password) {
      showStatus("Udfyld venligst alle felter", "#d93025");
      return;
    }

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      showStatus("Brugernavnet findes allerede", "#d93025");
      return;
    }

    await set(userRef, {
      username: username,
      password: password,
      createdAt: Date.now()
    });

    showStatus("Konto oprettet! Du sendes til login...", "green");

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1200);
  });
}

// SÆLG BØGER
const sellForm = document.getElementById('sellForm');
const sellButton = document.getElementById('sellSubmitBtn');

async function processSellForm() {
  console.log('Sell form submitted');
  showSellDebug('Submit ramte formularen', '#1f4fc7');

  const title = document.getElementById('bookTitle')?.value.trim();
  const author = document.getElementById('bookAuthor')?.value.trim();
  const condition = document.getElementById('bookCondition')?.value.trim();
  const price = document.getElementById('bookPrice')?.value.trim();
  const description = document.getElementById('bookDescription')?.value.trim();
  const coverInput = document.getElementById('bookCover');
  const coverFile = coverInput?.files?.[0];
  const seller = localStorage.getItem('loggedInUser') || 'Ukendt bruger';

  if (!title || !author || !condition || !price || !description) {
    console.log('Sell form validation failed');
    showSellDebug('Manglende felter i formularen', '#d93025');
    showStatus('Udfyld venligst alle felter', '#d93025');
    return;
  }

  let coverUrl = '';
  if (coverFile) {
    try {
      coverUrl = await fileToDataUrl(coverFile);
    } catch (error) {
      console.error('Kunne ikke læse billedet', error);
      showSellDebug('Kunne ikke læse billedet', '#d93025');
      showStatus('Kunne ikke læse billedet', '#d93025');
      return;
    }
  }

  try {
    const booksRef = ref(database, 'books');
    console.log('Writing book to database', { title, author, condition, price, description, coverUrl, seller });
    showSellDebug('Gemmer bogen i databasen...', '#1f4fc7');
    await push(booksRef, {
      title,
      author,
      condition,
      price,
      description,
      coverUrl,
      seller,
      createdAt: Date.now()
    });

    sellForm.reset();
    showSellDebug('Bogen blev gemt', 'green');
    showStatus('Bogen er sat til salg!', 'green');
  } catch (error) {
    console.error('Kunne ikke gemme bogen', error);
    showSellDebug('Kunne ikke gemme bogen', '#d93025');
    showStatus('Kunne ikke gemme bogen i databasen', '#d93025');
  }
}

if (sellForm) {
  console.log('Sell form found and listener attached');
  sellForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    processSellForm();
  });

  if (sellButton) {
    sellButton.addEventListener('click', function () {
      processSellForm();
    });
  }
} else {
  console.log('Sell form not found on this page');
}

if (document.querySelector('#book-grid')) {
  setupBookFeed();
  loadBooksViaRest();
}

// LOG UD: bind after DOM ready, hide when not logged in
function setupLogoutDelegation() {
  const updateVisibility = () => {
    document.querySelectorAll('#logoutBtn').forEach(el => {
      try {
        if (el.tagName === 'BUTTON') el.type = 'button';
        el.style.display = '';
      } catch (err) {
        console.error('Error updating logout button visibility', err);
      }
    });
  };

  // capture clicks early so we catch them even if other handlers exist
  function onDocClickCapture(e) {
    const btn = e.target.closest('#logoutBtn');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    console.log('Logout clicked (delegated) — showing confirmation and redirecting');
    try {
      showStatus('Logger ud…', 'green');
    } catch (err) {
      console.log('Logger ud...');
    }
    setTimeout(() => {
      try { localStorage.removeItem('loggedInUser'); } catch (err) { console.error(err); }
      window.location.href = 'login.html';
    }, 900);
  }

  updateVisibility();
  document.addEventListener('click', onDocClickCapture, true);
  // also observe for changes to localStorage in case login state changes in another tab
  window.addEventListener('storage', updateVisibility);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogoutDelegation);
} else {
  setupLogoutDelegation();
}

window.processSellForm = processSellForm;

// MIN BRUGER: vis brugerinfo og brugerens egne bøger + slette-funktion
function renderUserBooks(books, username) {
  const grid = document.getElementById('user-book-grid');
  if (!grid) return;

  const myBooks = Object.entries(books || {})
    .map(([id, book]) => ({ id, ...book }))
    .filter(b => (b.seller || '') === username)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (!myBooks.length) {
    grid.innerHTML = '<p>Du har ikke sat nogen bøger til salg endnu.</p>';
    return;
  }

  grid.innerHTML = myBooks.map(book => `
    <article class="book-card">
      ${book.coverUrl ? `<img class="book-cover" src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title || 'Bog')}"/>` : `<div class="book-cover book-cover-placeholder">📚</div>`}
      <div class="book-body">
        <h3 class="book-title">${escapeHtml(book.title || 'Uden titel')}</h3>
        <p class="book-author">${escapeHtml(book.author || 'Ukendt')}</p>
        <p class="seller">${escapeHtml(book.description || '')}</p>
        <div class="book-footer">
          <p class="price">${book.price ? escapeHtml(book.price) + ' kr.' : 'Pris mangler'}</p>
          <button data-delete-book="${escapeHtml(book.id)}" class="btn btn-danger">Slet</button>
        </div>
      </div>
    </article>
  `).join('');
}

async function deleteBook(bookId) {
  if (!confirm('Slet denne bog permanent?')) return;
  try {
    await remove(ref(database, `books/${bookId}`));
    showStatus('Bogen er slettet', 'green');
  } catch (err) {
    console.error('Kunne ikke slette bog', err);
    showStatus('Kunne ikke slette bogen', '#d93025');
  }
}

function setupUserPage() {
  const username = localStorage.getItem('loggedInUser');
  const infoEl = document.getElementById('user-info');
  if (infoEl) {
    infoEl.innerHTML = `<h2>${escapeHtml(username || 'Ukendt bruger')}</h2><p>Brugernavn: ${escapeHtml(username || '')}</p>`;
  }

  const booksRef = ref(database, 'books');
  onValue(booksRef, snapshot => {
    renderUserBooks(snapshot.val() || {}, username || '');
  }, (err) => console.error('Fejl ved hentning af brugerens bøger', err));
}

// delegate delete clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-delete-book]');
  if (!btn) return;
  const id = btn.dataset.deleteBook;
  if (id) deleteBook(id);
});

if (currentPage === 'min-bruger.html' || document.getElementById('user-book-grid')) {
  if (!isLoggedIn) {
    window.location.replace('login.html');
  } else {
    // ensure book feed + user page set up
    setupUserPage();
  }
}