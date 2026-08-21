'use strict';

const SHORT_LINKS = Object.freeze({
  "1": "https://idont82.github.io/blog/neck-fan-summer-social-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260810-seasonal-neck-fan",
  "2": "https://idont82.github.io/blog/wonyoung-eider-sheer-jacket-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260811-celebrity-wonyoung-eider",
  "3": "https://idont82.github.io/blog/blackpink-album-photocard-storage-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260812-idol-blackpink-photocard",
  "4": "https://link.coupang.com/re/AFFSDP?lptag=AF7523287&subid=fb-20260813-problem-water-size&pageKey=7666070794&itemId=23361506529&vendorItemId=86478559145&traceid=V0-153-edc79765d8325349&requestid=20260619074337320059429791&token=31850C%7CMIXED",
  "5": "https://idont82.github.io/blog/claw-machine-popular-plush-buying-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260814-claw-plush-guide",
  "6": "https://idont82.github.io/blog/uv-umbrella-summer-social-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260815-seasonal-uv-umbrella",
  "7": "https://idont82.github.io/blog/suzy-k2-dry-ice-shirt-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260816-celebrity-suzy-k2",
  "8": "https://link.coupang.com/re/AFFSDP?lptag=AF7523287&pageKey=8605982249&itemId=24957000399&vendorItemId=91962797578&traceid=V0-153-846b14b976e44a3e&requestid=20260731144457414200930702&token=31850C%7CMIXED&subid=fb-20260817-idol-seventeen-binder",
  "9": "https://idont82.github.io/blog/instant-rice-210g-vs-130g-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260818-problem-rice-size",
  "10": "https://idont82.github.io/blog/jamsil-bangi-claw-tour.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260819-claw-jamsil-tour",
  "11": "https://idont82.github.io/blog/mosquito-repellent-summer-social-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260820-seasonal-mosquito",
  "12": "https://idont82.github.io/blog/ive-album-photocard-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260821-idol-ive-photocard",
  "13": "https://link.coupang.com/re/AFFSDP?lptag=AF7523287&subid=fb-20260822-problem-rainy-commute&pageKey=8786048514&itemId=25567577396&vendorItemId=92545161555&traceid=V0-153-ea4dcab5383a4202&clickBeacon=b2f80590-75e7-11f1-a8aa-3f7425985894%7E3&requestid=20260702162902488267152368&token=31850C%7CMIXED",
  "14": "https://idont82.github.io/blog/waterpark-waterproof-kit-social-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260823-seasonal-waterpark",
  "15": "https://idont82.github.io/blog/best-value-laptop-top3-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260821-laptop-value-top3",
  "16": "https://idont82.github.io/blog/highest-performance-laptop-top3-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260821-laptop-performance-top3",
  "17": "https://idont82.github.io/blog/document-work-laptop-top3-guide.html?utm_source=facebook&utm_medium=social&utm_campaign=card_news&utm_content=20260821-laptop-document-top3"
});

function resolveShortLink(value) {
  const number = value === undefined || value === null ? '' : String(value);
  if (!/^[1-9]\d*$/.test(number)) {
    return '/';
  }
  return SHORT_LINKS[number] || '/';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHORT_LINKS, resolveShortLink };
}
