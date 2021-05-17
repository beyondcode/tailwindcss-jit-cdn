import observerScript from "./observer";

(() => {  
  const config = {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true, 
  };

  new MutationObserver(observerScript(false)).observe(
    document.documentElement,
    config
  );

  observerScript();

  window.tailwindCSS = {
    refresh: observerScript(true),
  }
})();