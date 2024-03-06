let listings = [];
let listingsDiv;
let observer;
let listingKillTimer;
const initObserver = () => observer.observe(listingsDiv, { childList: true, subtree: true });
const stopObserver = () => observer.disconnect();
const wearHashTable = {
  FT: 'Field-Tested',
  BS: 'Battle-Scarred',
  WW: 'Well-Worn',
  MW: 'Minimal Wear',
  FN: 'Factory New',
};

const editSteamListings = debounce(() => {
  clearTimeout(listingKillTimer);
  stopObserver();
  const skinNodes = document.querySelectorAll('.css-r2hwkq');
  for (const node of skinNodes) {
    const wearNode = node.querySelector('.css-vzanqz');
    const itemNode = node.querySelector('.css-1r7tr59');
    const skinNode = node.querySelector('.css-1n01ede');
    const nameStar = itemNode.innerText.indexOf('★') > -1 ? '★ ' : '';
    const name = `${nameStar}${itemNode.innerText.replace(/★ /g, '')} | ${skinNode.innerText} (${
      wearHashTable[wearNode.innerText]
    })`;

    const priceNode = node.querySelector('.css-1m2d7j4');
    const price = Math.ceil(priceNode.innerText.replace(/,/g, '') * 100);

    const floatNode = node.querySelector('.css-1fwtdvf');
    const floatLength = floatNode.innerText.substring(3).length;
    const float = floatNode.innerText.substring(1);
    floatNode.style.zIndex = '11';

    const hash = `${name}-${price}-${float}`;

    const foundItem = listings.find(
      ({ item }) =>
        item.hasOwnProperty('float') &&
        `${item.name}-${Math.ceil((item.askPrice / 100) * 100)}-${item.float.toFixed(
          floatLength
        )}` == hash
    );

    if (foundItem) {
      floatNode.innerText = `~${foundItem.item.float}`;
    }
  }

  initObserver();
  // kill observer after 8 minutes
  listingKillTimer = setTimeout(() => stopObserver(), 480000);
}, 1000);

chrome.runtime.onMessage.addListener((message) => {
  if (message?.event !== 'steamP2PListings' || message.listings.length === 0) return;

  // set global listings
  listings = message.listings;

  listingsDiv = document.querySelector('.css-15bx5k > div');
  observer = new MutationObserver(editSteamListings);
  editSteamListings();
  initObserver();
});
