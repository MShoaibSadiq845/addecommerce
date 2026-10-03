"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPriceInDescription = syncPriceInDescription;
function syncPriceInDescription(description, newPrice) {
    if (!description || typeof description !== 'string') {
        return description || '';
    }
    const num = Number(newPrice);
    if (newPrice === undefined || newPrice === null || isNaN(num) || num < 0) {
        return description;
    }
    const formattedPrice = num.toLocaleString('en-US');
    const priceRegex = /(\*{0,2}Price\s*[:\-]?\s*(?:Rs\.?|PKR|₨)?\s*\*{0,2}\s*)([\d,]+(?:\.\d{1,2})?)(\s*(?:\/-)?\s*(?:per\s*seat|\/\s*seat|\/\s*piece|\/\s*meter|\/\s*set)?\s*\*{0,2})/gi;
    if (priceRegex.test(description)) {
        return description.replace(priceRegex, (_match, prefix, _oldPrice, suffix) => {
            return `${prefix}${formattedPrice}${suffix}`;
        });
    }
    return description;
}
//# sourceMappingURL=price-description.util.js.map