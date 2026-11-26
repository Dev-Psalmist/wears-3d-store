import type { Product } from './types.js'

const SHOE_SIZES = ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45']
const commons = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1200`

/** OG Stores footwear collection. Image credits and licences are visible on product detail pages. */
export const products: Product[] = [
  {
    id: 'prd_canvas_01', slug: 'canvas-low-01', code: 'CANVAS 01', name: 'Classic Canvas Low-Top',
    model: 'tee', category: 'Canvas', series: 'Footwear 01', colorName: 'Ocean Blue',
    color: '#315D91', accent: '#79B8E8',
    imageUrl: 'https://c.pxhere.com/photos/35/fe/shoes_sneakers_canvas_shoes_blue_sport_sports_shoes_ankle_high_fashion-944256.jpg!d',
    imageCredit: 'PxHere community contributor', imageLicense: 'CC0 / Public Domain',
    imageSourceUrl: 'https://pxhere.com/en/photo/944256',
    price: 38500, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'An everyday canvas low-top with a clean profile, lace-up fastening and durable rubber sole.',
    details: ['Cotton canvas upper', 'Classic vulcanised rubber sole', 'Padded footbed', 'Everyday casual fit'], inStock: true,
  },
  {
    id: 'prd_canvas_02', slug: 'canvas-high-02', code: 'CANVAS 02', name: 'Heritage Canvas High-Top',
    model: 'tee', category: 'High-tops', series: 'Footwear 01', colorName: 'Black',
    color: '#242424', accent: '#B9B9B9',
    imageUrl: commons('High-Top sneakers.jpg'), imageCredit: 'MalcomXxtacy',
    imageLicense: 'CC BY 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:High-Top_sneakers.jpg',
    price: 42000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A high-top sneaker with ankle coverage, a supportive collar and a bold streetwear shape.',
    details: ['High-top ankle profile', 'Lace-up closure', 'Padded collar', 'Grippy rubber outsole'], inStock: true,
  },
  {
    id: 'prd_sneaker_03', slug: 'white-sneaker-03', code: 'SNEAKER 03', name: 'Essential White Sneaker',
    model: 'tee', category: 'Sneakers', series: 'Footwear 01', colorName: 'White',
    color: '#E9E9E5', accent: '#D6D6D0',
    imageUrl: commons('White sneakers.jpg'), imageCredit: 'Maksim Sokolov and Melania Sokolova',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:White_sneakers.jpg',
    price: 58000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A versatile white sneaker with a streamlined upper and a cushioned everyday silhouette.',
    details: ['Clean low-top profile', 'Comfort footbed', 'Durable rubber outsole', 'Easy everyday styling'], inStock: true,
  },
  {
    id: 'prd_running_04', slug: 'runner-04', code: 'RUNNER 04', name: 'Tempo Running Shoe',
    model: 'tee', category: 'Running', series: 'Footwear 01', colorName: 'Performance Grey',
    color: '#85898C', accent: '#B4C5D1',
    imageUrl: commons('Running shoes.jpg'), imageCredit: 'Tiia Monto',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Running_shoes.jpg',
    price: 78000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A lightweight running silhouette designed around breathable comfort and a flexible sole.',
    details: ['Lightweight running construction', 'Breathable upper', 'Cushioned midsole', 'Flexible traction outsole'], inStock: true,
  },
  {
    id: 'prd_sneaker_05', slug: 'blue-sneaker-05', code: 'SNEAKER 05', name: 'Blue Street Sneaker',
    model: 'tee', category: 'Sneakers', series: 'Footwear 01', colorName: 'Blue',
    color: '#315C91', accent: '#7FB2FF',
    imageUrl: commons('-01 sneakers.jpg'), imageCredit: 'Aklar1',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:-01_sneakers.jpg',
    price: 65000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A casual blue sneaker with a low-cut profile and a versatile everyday streetwear look.',
    details: ['Low-cut sneaker shape', 'Lace-up fastening', 'Padded interior', 'Durable rubber sole'], inStock: true,
  },
  {
    id: 'prd_sneaker_06', slug: 'black-sneaker-06', code: 'SNEAKER 06', name: 'Black Everyday Runner',
    model: 'tee', category: 'Sneakers', series: 'Footwear 01', colorName: 'Black',
    color: '#222326', accent: '#9EA3AA',
    imageUrl: commons('On Clouds running shoes.jpg'), imageCredit: 'Wikimedia Commons contributor',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:On_Clouds_running_shoes.jpg',
    price: 89000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A modern black running-inspired sneaker with a technical profile for daily movement.',
    details: ['Technical upper', 'Cushioned sole profile', 'Padded heel collar', 'Everyday active styling'], inStock: true,
  },
  {
    id: 'prd_oxford_07', slug: 'oxford-07', code: 'OXFORD 07', name: 'Classic Black Oxford',
    model: 'tee', category: 'Oxford', series: 'Footwear 01', colorName: 'Polished Black',
    color: '#171719', accent: '#A7A7A7',
    imageUrl: commons('Oxford shoe1.jpg'), imageCredit: 'Kan8eDie',
    imageLicense: 'CC BY-SA 3.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Oxford_shoe1.jpg',
    price: 96000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A timeless cap-toe Oxford profile for formal occasions, office wear and tailored outfits.',
    details: ['Cap-toe Oxford design', 'Closed-lacing construction', 'Polished leather finish', 'Smart formal styling'], inStock: true,
  },
  {
    id: 'prd_derby_08', slug: 'derby-08', code: 'DERBY 08', name: 'Executive Leather Derby',
    model: 'tee', category: 'Derby', series: 'Footwear 01', colorName: 'Black Leather',
    color: '#242424', accent: '#B8A48B',
    imageUrl: commons('Mens dress shoes.jpg'), imageCredit: 'Petar Milošević',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Mens_dress_shoes.jpg',
    price: 112000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A refined open-lacing Derby shoe with a versatile profile for business and smart-casual dressing.',
    details: ['Open-lacing Derby construction', 'Classic rounded toe', 'Structured sole', 'Office-to-evening versatility'], inStock: true,
  },
  {
    id: 'prd_oxford_09', slug: 'oxford-09', code: 'OXFORD 09', name: 'Burgundy Leather Oxford',
    model: 'tee', category: 'Formal', series: 'Footwear 01', colorName: 'Burgundy',
    color: '#682F34', accent: '#C48B86',
    imageUrl: commons('Red leather oxford shoes by Eugene Pik (2021) 01.jpg'), imageCredit: 'Eugenepik',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Red_leather_oxford_shoes_by_Eugene_Pik_(2021)_01.jpg',
    price: 125000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A statement leather Oxford in a rich burgundy tone, bringing a polished finish to formal dressing.',
    details: ['Burgundy leather upper', 'Traditional Oxford lacing', 'Refined toe shape', 'Dress-ready finish'], inStock: true,
  },
  {
    id: 'prd_formal_10', slug: 'formal-10', code: 'FORMAL 10', name: 'Premium Leather Formal Shoe',
    model: 'tee', category: 'Formal', series: 'Footwear 01', colorName: 'Classic Black',
    color: '#202124', accent: '#A7A7A7',
    imageUrl: commons('Leather shoes.jpg'), imageCredit: 'Aerous',
    imageLicense: 'CC BY-SA 4.0', imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Leather_shoes.jpg',
    price: 145000, currency: 'NGN', sizes: SHOE_SIZES, sizeSet: 'apparel',
    description: 'A polished leather formal shoe with a classic silhouette for business, ceremonies and special occasions.',
    details: ['Leather upper', 'Classic formal profile', 'Structured sole', 'Smart occasion wear'], inStock: true,
  },
]

export function findProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug.toLowerCase())
}
