// scripts.js
import { searchImages, perPage } from './js/api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

form.addEventListener('submit', async event => {
  event.preventDefault();
  currentPage = 1;
  currentQuery = form.searchQuery.value.trim();

  if (currentQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    hideLoadMoreBtn(); // Скрываем кнопку при пустом запросе
    // clearGallery(); // Очищаем галерею при пустом запросе
    return;
  }

  clearGallery();
  await performSearch(currentQuery);
  form.searchQuery.value = ''; // Очищаем поле ввода
});

loadMoreBtn.addEventListener('click', async () => {
  await loadMoreImages();
});

async function performSearch(query) {
  const data = await searchImages(query, currentPage);

  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    hideLoadMoreBtn();
    return;
  }

  data.hits.forEach(image => {
    const card = createImageCard(image);
    const lightboxLink = document.createElement('a');
    lightboxLink.href = image.largeImageURL;
    lightboxLink.dataset.lightbox = 'gallery';
    lightboxLink.appendChild(card);
    gallery.appendChild(lightboxLink);
  });

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();

  if (currentPage === 1) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  if (data.totalHits <= currentPage * perPage) {
    hideLoadMoreBtn();
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    showLoadMoreBtn();
    currentPage++;
  }

  smoothScrollToNextGroup();
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');
  card.innerHTML = `
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item"><b>Likes:</b> ${image.likes}</p>
      <p class="info-item"><b>Views:</b> ${image.views}</p>
      <p class="info-item"><b>Comments:</b> ${image.comments}</p>
      <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
    </div>
  `;
  return card;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

async function loadMoreImages() {
  if (currentQuery === '') {
    return;
  }

  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = 'Loading...';

  await performSearch(currentQuery);

  loadMoreBtn.disabled = false;
  loadMoreBtn.textContent = 'Load more';
}

function smoothScrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
