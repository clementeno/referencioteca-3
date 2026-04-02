// HEADER_ACTIVE_START: marca automáticamente el botón activo según URL
(function () {
  function normalizePath(pathname) {
    const clean = String(pathname || "").replace(/\/+$/, "");
    const tail = clean.split("/").pop() || "index";
    return tail || "index";
  }

  function pageKey(pathname) {
    const tail = normalizePath(pathname).toLowerCase();
    if (!tail || tail === "index" || tail === "index.html") return "index";
    return tail.replace(/\.html$/i, "");
  }

  const currentPage = pageKey(window.location.pathname);
  const links = document.querySelectorAll(
    ".ref2d__header-actions a[href], .ref2d__header-more-dropdown a[href]"
  );

  links.forEach((link) => {
    let targetPage = "index";
    try {
      targetPage = pageKey(new URL(link.getAttribute("href"), window.location.href).pathname);
    } catch (_err) {
      targetPage = pageKey(link.getAttribute("href"));
    }

    if (targetPage === currentPage) {
      link.setAttribute("aria-current", "page");
      link.classList.add("is-current");
    } else if (link.classList.contains("is-current")) {
      link.classList.remove("is-current");
    }
  });
})();
// HEADER_ACTIVE_END: marca automáticamente el botón activo según URL
