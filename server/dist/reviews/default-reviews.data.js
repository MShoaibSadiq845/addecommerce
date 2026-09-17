"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATING_PATTERNS = exports.ROMAN_URDU_4_STAR_COMMENTS = exports.ROMAN_URDU_5_STAR_COMMENTS = exports.PAKISTANI_GIRL_NAMES = exports.PAKISTANI_BOY_NAMES = void 0;
exports.buildDefaultReviews = buildDefaultReviews;
exports.PAKISTANI_BOY_NAMES = [
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
    'Waqas Ashraf',
    'Naveed Akhtar',
    'Junaid Jamshed',
    'Rizwan Butt',
    'Fahad Mustafa',
    'Sohail Anjum',
    'Zubair Chaudhry',
    'Imran Abbasi',
    'Kamran Akmal',
    'Kashif Mehmood',
    'Adeel Sarwar',
    'Mubeen Shah',
    'Arsalan Baig',
    'Sheraz Qadir',
    'Faizan Sheikh',
    'Murtaza Ali',
    'Yasir Hameed',
    'Shahbaz Sharif',
    'Rehan Siddique',
];
exports.PAKISTANI_GIRL_NAMES = [
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
    'Hania Amir',
    'Nimra Ahmed',
    'Areeba Habib',
    'Sidra Tul Ain',
    'Bushra Ansari',
    'Rabia Basri',
    'Amna Ilyas',
    'Komal Rizvi',
    'Saba Qamar',
    'Zoya Nasir',
    'Mawra Hocane',
    'Momina Mustehsan',
    'Urwa Hocane',
    'Iqra Aziz',
    'Dua Zahra',
    'Nida Yasir',
    'Ayeza Khan',
    'Yumna Zaidi',
    'Sajal Aly',
];
exports.ROMAN_URDU_5_STAR_COMMENTS = [
    'Bohat zabardast quality hai! Fabric boht acha hai aur fitting bhi perfect aayi hai. Delivery bht fast thi, highly recommended!',
    'Kapra aur stitching bohot pyari hai, jesa picture mein dikhaya tha bilkul wesa hi aya. Paisay wasool!',
    'Overall experience bohat acha raha. Delivery time pe mili aur packaging bhi zabardast thi. 10/10 quality!',
    'Bohat ala cheez hai, color aur design boht pasand aya. Definitely dobara order karungi!',
    'Mashallah bohot pyari cheez hai. Stitching aur quality dono no. 1 hain. Bohot shukriya Fab Decor!',
    'Quality outstanding hai, kapra soft aur comfortable hai. Worth every rupee, family ko bhi bohot pasand aaya!',
    'Delivery bohat tez thi aur product quality bilkul original aur premium hai. Shandar experience!',
    'Bohat khoobsurat product hai, packaging bhi classy thi. Fitting bilkul accurate aayi hai. Recommended!',
    'Main bohot satisfied hoon. Cloth material bohat soft aur breathable hai. 5 stars!',
    'Super fast delivery aur zabardast quality! Bilkul wesa hi hai jese details mein mention tha.',
    'Bohot zabardast product hai! Price ke hisab se quality bohot behtareen hai.',
    'Pure cotton material hai aur fitting bilkul perfect hai. 100% recommended!',
    'Mera first experience tha aur bohot zabardast raha. Definitely dobara order karunga.',
    'Stitching aur finishing bohot clean hai. Really happy with the purchase!',
    'Fabric bohot soft hai aur wash hone ke baad bhi shine bilkul fresh rahi. Super happy!',
    'Packaging bohat secure thi aur quality to lajwab hai. Very trustworthy store!',
    'Bilkul original stuff hai, 100% satisfied. Bohot shukriya itni achi service ke liye.',
    'Family ke sab members ko kapra bohot pasand aya. Size bhi perfect aaya hai.',
];
exports.ROMAN_URDU_4_STAR_COMMENTS = [
    'Quality achi hai, rate ke hisab se behtareen product hai. Delivery thori late thi par product perfect hai.',
    'Finishing bohat clean hai aur material comfortable hai. Overall bohot acha experience raha, 4 stars!',
    'Achi quality hai, color shade bilkul same hai jesa photo mein tha. Bohot pasand aaya.',
    'Kapra acha hai aur price bhi munasib hai. Ek din delivery delay hui par overall good product.',
    'Maine pehli dafa order kiya tha aur product bht acha nikla. Size bilkul accurate hai, recommended.',
    'Bohot achi cheez hai, stitching mazboot hai. Value for money product hai.',
    'Product acha hai, jesa socha tha wesa hi mila. Packaging aur delivery theek thi.',
    'Fitting achi hai aur color bhi fade nahi hua wash ke baad. Acha experience raha.',
    'Cloth quality achi hai, stitching bhi mazboot hai. Value for money.',
    'Overall satisfaction achi hai, timing aur packing dono theek the.',
    'Kapre ka fall bohot pyara hai, color bilkul exact hai. Recommended!',
    'Design bohot graceful hai. Delivery standard time pe mil gayi thi.',
];
exports.RATING_PATTERNS = [
    [5, 4, 5, 5, 4, 5, 5],
    [4, 5, 4, 5, 5, 4, 5],
    [5, 5, 4, 5, 4, 5, 5],
    [4, 5, 5, 5, 4, 5, 4],
];
function getHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
function buildDefaultReviews(productId, productName, seedOffset = 0, totalCount = 7, existingNames = [], existingComments = []) {
    const seed = getHashCode(productId || productName || 'fab_decor') + seedOffset;
    const patternIndex = seed % exports.RATING_PATTERNS.length;
    const ratings = exports.RATING_PATTERNS[patternIndex];
    const usedNames = new Set(existingNames.map((n) => n.trim().toLowerCase()));
    const usedComments = new Set(existingComments.map((c) => c.trim().toLowerCase()));
    const reviews = [];
    const now = Date.now();
    for (let i = 0; i < totalCount; i++) {
        const rating = ratings[i % ratings.length] ?? 5;
        let reviewerName = '';
        let nameAttempt = 0;
        while (nameAttempt < 50) {
            const isGirl = ((seed + i + nameAttempt) % 2) === 1;
            const nameList = isGirl ? exports.PAKISTANI_GIRL_NAMES : exports.PAKISTANI_BOY_NAMES;
            const nameIdx = (seed + i * 7 + nameAttempt * 3) % nameList.length;
            const candidate = nameList[nameIdx];
            if (!usedNames.has(candidate.toLowerCase())) {
                reviewerName = candidate;
                usedNames.add(candidate.toLowerCase());
                break;
            }
            nameAttempt++;
        }
        if (!reviewerName) {
            reviewerName = `Customer ${i + 1}`;
        }
        const commentPool = rating === 5 ? exports.ROMAN_URDU_5_STAR_COMMENTS : exports.ROMAN_URDU_4_STAR_COMMENTS;
        let comment = '';
        let commentAttempt = 0;
        while (commentAttempt < 50) {
            const cIdx = (seed + i * 5 + commentAttempt * 2) % commentPool.length;
            const candidateComment = commentPool[cIdx];
            if (!usedComments.has(candidateComment.toLowerCase())) {
                comment = candidateComment;
                usedComments.add(candidateComment.toLowerCase());
                break;
            }
            commentAttempt++;
        }
        if (!comment) {
            comment = commentPool[(seed + i) % commentPool.length];
        }
        const daysAgo = (totalCount - i) * 2 + ((seed + i) % 3);
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
//# sourceMappingURL=default-reviews.data.js.map