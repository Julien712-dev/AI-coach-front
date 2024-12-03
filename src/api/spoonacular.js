import axios from 'axios'

// To use axios with some preset options.
export default axios.create({
  // No '/' at the end
  baseURL: 'https://api.spoonacular.com/recipes',
})