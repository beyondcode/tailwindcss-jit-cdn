import observerScript from "./observer";

(() => {
  const config = {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  };

  // Set the default options
  let options = {
      observerElement: document.documentElement
  };

  // If the user specified values for window.tailwindOptions, merge those options
  if(typeof window.tailwindOptions !== 'undefined'){
      options = { ...options, ...window.tailwindOptions };
  }

  new MutationObserver(observerScript(options, false)).observe(
    options.observerElement,
    config
  );

  observerScript();

  window.tailwindCSS = {
    refresh: observerScript(options, true),
  }
})();
