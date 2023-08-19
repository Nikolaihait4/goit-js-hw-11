import { Report } from 'notiflix/build/notiflix-report-aio';
import { fetchAndRenderImages, renderImages } from './js/getpic';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let searchQuery = '';

// Функция для загрузки новой группы изображений при скролле
const loadImagesOnScroll = async () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    currentPage++;
    await fetchAndRenderImages(
      searchQuery,
      currentPage,
      renderImages,
      gallery,
      loadMoreBtn
    );
    smoothScrollToNextGroup();
  }
};

// Функция для плавной прокрутки к следующей группе изображений
const smoothScrollToNextGroup = () => {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

// Обработчик события отправки формы поиска
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
  await fetchAndRenderImages(
    searchQuery,
    currentPage,
    renderImages,
    gallery,
    loadMoreBtn
  );
  event.target.elements.searchQuery.value = '';
  smoothScrollToNextGroup();
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchAndRenderImages(
    searchQuery,
    currentPage,
    renderImages,
    gallery,
    loadMoreBtn
  );
  searchForm.elements.searchQuery.value = '';
  smoothScrollToNextGroup();
});

// Обработчик события DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
  });
  window.addEventListener('scroll', loadImagesOnScroll); // Добавление обработчика события скролла
});
