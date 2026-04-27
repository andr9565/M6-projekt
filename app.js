import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
import {
  getDatabase,
  onValue,
  ref,
  set
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

isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn("Analytics kunne ikke startes:", error);
  });

const books = [
  {
    title: "Introduktion til Programmering",
    author: "Lars Nielsen",
    tags: ["Datalogi", "God"],
    seller: "Marie Hansen",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Grundlæggende Kemi",
    author: "Anna Sorensen",
    tags: ["Kemi", "Som ny"],
    seller: "Peter Jensen",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Calculus og Lineær Algebra",
    author: "Henrik Madsen",
    tags: ["Matematik", "Acceptabel"],
    seller: "Sophie Andersen",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80"
  }
];

function normalizeBook(book) {
  return {
    title: book?.title || "Ukendt titel",
    author: book?.author || "Ukendt forfatter",
    tags: Array.isArray(book?.tags) ? book.tags : [],
    seller: book?.seller || "Ukendt sælger",
    price: Number(book?.price) || 0,
    image:
      book?.image ||
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
  };
}

function formatPrice(price) {
  return `${price} kr.`;
}

function createBookCard(book) {
  const article = document.createElement("article");
  article.className = "book-card";

  const tagsMarkup = book.tags
    .map((tag) => `<span class="pill">${tag}</span>`)
    .join("");

  article.innerHTML = `
    <img class="book-cover" src="${book.image}" alt="Forsidebillede for ${book.title}">
    <div class="book-body">
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">${book.author}</p>
      <div class="pill-row">${tagsMarkup}</div>
      <p class="seller">Sælger: ${book.seller}</p>
      <div class="book-footer">
        <p class="price">${formatPrice(book.price)}</p>
        <button class="contact-btn" type="button">Kontakt sælger</button>
      </div>
    </div>
  `;

  return article;
}

function renderBooks(bookList) {
  const grid = document.getElementById("book-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  bookList.forEach((book) => {
    grid.appendChild(createBookCard(book));
  });
}

function showStatus(message, color) {
  const statusEl = document.getElementById("status");
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.style.color = color;
}

async function ensureSeedData() {
  const booksRef = ref(database, "books");
  return new Promise((resolve, reject) => {
    onValue(
      booksRef,
      async (snapshot) => {
        const value = snapshot.val();
        if (value && Object.keys(value).length > 0) {
          resolve();
          return;
        }

        try {
          await set(booksRef, books);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      {
        onlyOnce: true
      }
    );
  });
}

function subscribeToBooks() {
  const booksRef = ref(database, "books");

  onValue(
    booksRef,
    (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        renderBooks([]);
        showStatus("Ingen bøger fundet", "#ffd7a2");
        return;
      }

      const bookList = Object.values(data).map(normalizeBook);
      renderBooks(bookList);
      showStatus("Forbundet til Realtime Database", "#9ac0ff");
    },
    (error) => {
      console.error("Kunne ikke hente bøger:", error);
      renderBooks(books.map(normalizeBook));
      showStatus("Viser lokale data (db-fejl)", "#ff8f8f");
    }
  );
}

function setupMenuToggle() {
  const items = [...document.querySelectorAll(".menu-item")];
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((menuItem) => menuItem.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

async function setupFirebaseStatus() {
  try {
    await ensureSeedData();
    subscribeToBooks();
  } catch (error) {
    renderBooks(books.map(normalizeBook));
    showStatus("Firebase ikke aktiv", "#ff8f8f");
    console.error("Firebase fejl:", error);
  }
}

renderBooks(books.map(normalizeBook));
setupMenuToggle();
setupFirebaseStatus();