import { Report } from 'notiflix/build/notiflix-report-aio';
import { searchImages } from './js/api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let searchQuery = '';

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  searchQuery = event.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    try {
      throw new Error('Please enter a search query.');
    } catch (error) {
      Report.failure(error.message);
    }
    return;
  }
  currentPage = 1;
  gallery.innerHTML = '';
  await fetchAndRenderImages(searchQuery, currentPage);
  event.target.elements.searchQuery.value = '';
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchAndRenderImages(searchQuery, currentPage);
  searchForm.elements.searchQuery.value = '';
});

document.addEventListener('DOMContentLoaded', () => {
  new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'title',
  });
  window.addEventListener('scroll', handleScroll);
});

async function fetchAndRenderImages(query, page) {
  try {
    const responseData = await searchImages(query, page);
    const images = responseData.hits;
    if (images.length === 0) {
      Report.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('hidden');
      return;
    }

    renderImages(images);
    loadMoreBtn.classList.remove('hidden');

    if (query !== searchQuery) {
      Report.success(
        'Success',
        'Hooray!',
        `We found ${responseData.totalHits} images.`
      );
      searchQuery = query;
    }
  } catch (error) {
    Report.failure('Error fetching images:', error);
  }
}

function renderImages(images) {
  const galleryMarkup = images
    .map(
      image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="gallery" data-title="${image.tags}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${image.likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${image.views}
        </p>
        <p class="info-item">
          <b>Comments:</b> ${image.comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${image.downloads}
        </p>
      </div>
    </div>
  `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', galleryMarkup);

  const lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'title',
  });
  lightbox.refresh();
}

function handleScroll() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    currentPage++;
    fetchAndRenderImages(searchQuery, currentPage);
  }
}
