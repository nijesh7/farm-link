const createCategoryImage = (label, emoji, colors) => {
  const [start, end, accent] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs>
    <rect width="800" height="520" fill="url(#bg)"/>
    <circle cx="90" cy="80" r="150" fill="#fff" opacity=".13"/><circle cx="730" cy="445" r="220" fill="#fff" opacity=".1"/>
    <path d="M0 410C155 340 265 475 430 407S655 335 800 395V520H0Z" fill="${accent}" opacity=".55"/>
    <text x="400" y="285" text-anchor="middle" font-size="170">${emoji}</text>
    <text x="400" y="405" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="42" font-weight="700">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const CATEGORY_IMAGES = {
  Vegetables: createCategoryImage('Fresh Vegetables', '🥕', ['#4f9b45', '#1f613a', '#a6cf57']),
  Fruits: createCategoryImage('Fresh Fruits', '🍎', ['#e3614f', '#9f2633', '#f2a64b']),
  Grains: createCategoryImage('Farm Grains', '🌾', ['#cf9b42', '#8a5d25', '#e6cf74']),
  Pulses: createCategoryImage('Nutritious Pulses', '🫘', ['#b86d4d', '#70412d', '#d9ad69']),
  'Leafy Greens': createCategoryImage('Leafy Greens', '🥬', ['#4caa69', '#176044', '#9bd766']),
  Dairy: createCategoryImage('Farm Dairy', '🥛', ['#719cc5', '#41698f', '#d2e5ef']),
  'Organic Products': createCategoryImage('Organic Products', '🌱', ['#748d42', '#395f35', '#bad16a']),
};

const FALLBACK_IMAGE = CATEGORY_IMAGES['Organic Products'];

export const getCategoryImage = (category) => CATEGORY_IMAGES[category] || FALLBACK_IMAGE;

// Product photos are not uploaded by the listing form, so always use the
// category illustration. This also repairs older listings with broken URLs.
export const getProductImage = ({ category }) => getCategoryImage(category);
