const EXTENSION_KEY = 'kbpldeeidclljkeghdicoipnhmjpjeae';

(function (ns, fetch) {
  if (typeof fetch !== 'function') return;

  ns.fetch = async function () {
    const fetchObject = await fetch.apply(this, arguments);

    const message = await chrome.runtime.sendMessage(EXTENSION_KEY, {
      event: 'fetch',
      url: arguments[0],
    });

    // clone the response so that we can run async code without effecting original promise state
    if (message?.intercept === true) {
      const cloned = await fetchObject.clone();
      const json = await cloned.json();
      chrome.runtime.sendMessage(EXTENSION_KEY, {
        event: 'fetchResponse',
        url: arguments[0],
        body: json,
      });
    }

    return fetchObject;
  };
})(window, window.fetch);
