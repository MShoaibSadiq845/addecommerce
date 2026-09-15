export const PAKISTANI_BOY_NAMES = [
  'Ali Khan',
  'Hamza Tariq',
  'Usman Javed',
  'Bilal Ahmed',
  'Daniyal Shah',
  'Farhan Malik',
  'Saad Qureshi',
  'Zeeshan Ali',
  'Hassan Raza',
  'Ahmed Nawaz',
  'Omer Farooq',
  'Taha Siddiqui',
  'Asad Mehmood',
  'Haris Sheikh',
  'Babar Azam',
  'Shahmeer Khan',
];

export const PAKISTANI_GIRL_NAMES = [
  'Ayesha Malik',
  'Fatima Zahra',
  'Zainab Noor',
  'Sana Tariq',
  'Maryam Bibi',
  'Hira Faisal',
  'Anum Sheikh',
  'Maham Imran',
  'Iqra Batool',
  'Noor Fatima',
  'Sara Khan',
  'Kinza Javaid',
  'Laiba Rehman',
  'Alizeh Shah',
  'Sadia Pervez',
  'Mehak Gul',
];

export const ROMAN_URDU_5_STAR_COMMENTS = [
  'Bohat zabardast quality hai! Fabric boht acha hai aur fitting bhi perfect aayi hai. Delivery bht fast thi, highly recommended!',
  'Kapra aur stitching bohot pyari hai, jesa picture mein dikhaya tha bilkul wesa hi aya. Paisay wasool!',
  'Overall experience bohat acha raha. Delivery time pe mili aur packaging bhi zabardast thi. 10/10 quality!',
  'Bohat ala cheez hai, color aur design boht pasand aya. Definitely dobara order karungi!',
  'Mashallah bohot pyari cheez hai. Stitching aur quality dono no. 1 hain. Bohot shukriya SHOP.CO!',
  'Quality outstanding hai, kapra soft aur comfortable hai. Worth every rupee, family ko bhi bohot pasand aaya!',
  'Delivery bohat tez thi aur product quality bilkul original aur premium hai. Shandar experience!',
  'Bohat khoobsurat product hai, packaging bhi classy thi. Fitting bilkul accurate aayi hai. Recommended!',
  'Main bohot satisfied hoon. Cloth material bohat soft aur breathable hai. 5 stars!',
  'Super fast delivery aur zabardast quality! Bilkul wesa hi hai jese details mein mention tha.',
];

export const ROMAN_URDU_4_STAR_COMMENTS = [
  'Quality achi hai, rate ke hisab se behtareen product hai. Delivery thori late thi par product perfect hai.',
  'Finishing bohat clean hai aur material comfortable hai. Overall bohot acha experience raha, 4 stars!',
  'Achi quality hai, color shade bilkul same hai jesa photo mein tha. Bohot pasand aaya.',
  'Kapra acha hai aur price bhi munasib hai. Ek din delivery delay hui par overall good product.',
  'Maine pehli dafa order kiya tha aur product bht acha nikla. Size bilkul accurate hai, recommended.',
  'Bohot achi cheez hai, stitching mazboot hai. Value for money product hai.',
  'Product acha hai, jesa socha tha wesa hi mila. Packaging aur delivery theek thi.',
  'Fitting achi hai aur color bhi fade nahi hua wash ke baad. Acha experience raha.',
];

export const RATING_PATTERNS = [
  [5, 4, 5],
  [4, 5, 4],
  [5, 5, 4],
  [4, 5, 5],
];

export interface DefaultReviewItem {
  name: string;
  user_name: string;
  rating: number;
  comment: string;
  productId: string;
  productName: string;
  createdAt: Date;
  created_at?: Date;
}

/**
 * Deterministically generates a numeric hash code from a string.
 */
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Builds 3 default customer reviews in Roman Urdu with Pakistani boy/girl names
 * and rotating rating pattern for a specific product.
 */
export function buildDefaultReviews(
  productId: string,
  productName: string,
  seedOffset = 0,
): DefaultReviewItem[] {
  const seed = getHashCode(productId || productName || 'shop_co') + seedOffset;
  const patternIndex = seed % RATING_PATTERNS.length;
  const ratings = RATING_PATTERNS[patternIndex];

  const reviews: DefaultReviewItem[] = [];
  const now = Date.now();

  for (let i = 0; i < 3; i++) {
    const rating = ratings[i];
    const isGirl = (seed + i) % 2 === 1;

    // Pick Pakistani name
    const nameList = isGirl ? PAKISTANI_GIRL_NAMES : PAKISTANI_BOY_NAMES;
    const nameIndex = (seed + i * 3) % nameList.length;
    const reviewerName = nameList[nameIndex];

    // Pick Roman Urdu comment matching the rating
    const commentPool =
      rating === 5 ? ROMAN_URDU_5_STAR_COMMENTS : ROMAN_URDU_4_STAR_COMMENTS;
    const commentIndex = (seed + i * 5) % commentPool.length;
    const comment = commentPool[commentIndex];

    // Space reviews out realistically across the past 1-7 days
    const daysAgo = (3 - i) * 2 + ((seed + i) % 2);
    const reviewDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

    reviews.push({
      name: reviewerName,
      user_name: reviewerName,
      rating,
      comment,
      productId,
      productName,
      createdAt: reviewDate,
      created_at: reviewDate,
    });
  }

  return reviews;
}
