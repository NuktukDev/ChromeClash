const DOMAIN = 'https://clash.gg/';
const STEAM_P2P_LISTINGS = '/api/steam-p2p/listings';
const WAXPEER_LISTINGS = '/api/payments/waxpeer/listings/csgo';
const RAIN = '/api/rain';
const EXTENSION_KEY = 'kbpldeeidclljkeghdicoipnhmjpjeae';

const requestUrls = [STEAM_P2P_LISTINGS, RAIN];
const checkRequestUrl = (url) => requestUrls.includes(url);

const handleRain = async (response) => {
  if (response?.pot > 0) {
    chrome.notifications.create({
      iconUrl: './images/icon.png',
      message: 'RAIN HAS STARTED!',
      contextMessage: `Current Pot: ${(response.pot / 100).toFixed(2)} gems`,
      priority: 2,
      title: 'Clash.gg Rain!',
      type: 'basic',
    });
  }
};

const handleFetchEvent = (url, sender) => {
  if (sender.url !== DOMAIN || !checkRequestUrl(url)) {
    return { intercept: false };
  }

  return { intercept: true };
};

const handleFetchResponseEvent = async (url, sender, response) => {
  if (sender.url !== DOMAIN) {
    return false;
  }
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (STEAM_P2P_LISTINGS === url) {
    const message = {
      event: 'steamP2PListings',
      listings: response,
    };
    chrome.tabs.sendMessage(tab.id, message);
  } else if (WAXPEER_LISTINGS === url) {
    const message = {
      event: 'waxPeerListings',
      listings: response,
    };
    chrome.tabs.sendMessage(tab.id, message);
  } else if (RAIN === url) {
    handleRain(response);
  }
};

// listen for message events, and invoke proper handlers
chrome.runtime.onMessageExternal.addListener(
  ({ event = null, url, body = null }, sender, sendResponse) => {
    let response;
    switch (event) {
      case 'fetch':
        response = handleFetchEvent(url, sender);
        break;
      case 'fetchResponse':
        response = handleFetchResponseEvent(url, sender, body);
        break;
    }

    sendResponse(response);
  }
);
