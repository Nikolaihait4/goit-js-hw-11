import axios from 'axios';
import { Report } from 'notiflix/build/notiflix-report-aio';

const API_KEY = '38927636-b5f6066692f15e9e72ed3611e';

let isFirstSearch = true; // Переменная для отслеживания первого поиска

// Функция для выполнения HTTP-запроса к API Pixabay
export async function fetchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: 40,
      },
    });
    return response.data; // Возвращаем объект с данными, включая totalHits
  } catch (error) {
    throw error; // В случае ошибки выбрасываем исключение
  }
}

// Функция для загрузки и отрисовки изображений
export async function fetchAndRenderImages(
  query,
  page,
  renderFunction,
  gallery,
  loadMoreBtn
) {
  try {
    const responseData = await fetchImages(query, page); // Получаем объект с данными
    const images = responseData.hits; // Получаем массив изображений
    if (images.length === 0) {
      Report.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      ); // Уведомление, если нет результатов
      loadMoreBtn.classList.add('hidden');
      return;
    }

    renderFunction(images, gallery);
    loadMoreBtn.classList.remove('hidden');
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    // Если это первый поиск или запрос отличается от предыдущего, выводим уведомление
    if (isFirstSearch || query !== previousSearchQuery) {
      Report.success(`Hooray! We found ${responseData.totalHits} images.`);
      isFirstSearch = false;
      previousSearchQuery = query; // Обновляем предыдущий запрос
    }
  } catch (error) {
    Report.failure('Error fetching images:', error);
  }
}

// Функция для отрисовки массива изображений в галерее
export function renderImages(images, gallery) {
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
  gallery.insertAdjacentHTML('beforeend', galleryMarkup); // Добавляем разметку в галерею
  const lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
  });
  lightbox.refresh(); // Обновляем lightbox для новых изображений
}
