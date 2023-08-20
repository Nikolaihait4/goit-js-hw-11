import axios from 'axios';

const API_KEY = '38927636-b5f6066692f15e9e72ed3611e';

export async function searchImages(query, page) {
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
    return response.data;
  } catch (error) {
    throw error;
  }
}
