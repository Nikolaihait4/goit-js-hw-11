export const perPage = 40;

export async function searchImages(query, page) {
  const apiKey = '38927636-b5f6066692f15e9e72ed3611e';
  const baseUrl = 'https://pixabay.com/api/';
  const response = await fetch(
    `${baseUrl}?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  const data = await response.json();
  return data;
}
