/* SELECCION_START: cápsulas históricas + grilla vigente (lógica simple) */
(function () {
  const source = window.Refx2DSelectionData || null;
  const cfg = source && source.config ? source.config : null;
  const historical = source && Array.isArray(source.historicalProjects) ? source.historicalProjects.slice() : [];

  const titleEl = document.getElementById("seleccionTitulo");
  const descEl = document.getElementById("seleccionDescripcion");
  const metaEl = document.getElementById("seleccionMeta");
  const frequencyEl = document.getElementById("seleccionFrecuencia");
  const capsulesEl = document.getElementById("seleccionCapsulas");
  const capsuleDetailEl = document.getElementById("seleccionCapsulaDetalle");
  const rightTitleEl = document.getElementById("seleccionActualTitle");
  const gridEl = document.getElementById("seleccionGrid");
  const wordlineAEl = document.getElementById("seleccionWordlineA");
  const wordlineBEl = document.getElementById("seleccionWordlineB");
  const wordtrackEl = document.querySelector(".seleccion__wordtrack");
  const overlayEl = document.getElementById("seleccionOverlay");
  const modalCloseEl = document.getElementById("seleccionModalClose");
  const modalImgEl = document.getElementById("seleccionModalImg");
  const modalTitleEl = document.getElementById("seleccionModalTitle");
  const modalAuthorEl = document.getElementById("seleccionModalAuthor");
  const modalRoleEl = document.getElementById("seleccionModalRole");
  const modalNoteEl = document.getElementById("seleccionModalNote");
  const modalTagsEl = document.getElementById("seleccionModalTags");
  const modalLinkEl = document.getElementById("seleccionModalLink");

  if (!titleEl || !descEl || !metaEl || !frequencyEl || !capsulesEl || !capsuleDetailEl || !rightTitleEl || !gridEl) return;

  if (!cfg || typeof cfg !== "object") {
    gridEl.innerHTML = '<p class="seleccion__empty">No se pudo cargar la fuente de selección desde <code>ref2d.js</code>.</p>';
    return;
  }

  function parseSelectionNumber(selectionRef) {
    const raw = String(selectionRef || "");
    const matches = raw.match(/\d+/g);
    if (!matches || !matches.length) return 0;
    return Number(matches[matches.length - 1]) || 0;
  }

  function formatSelectionCode(selectionRef) {
    return `R${String(parseSelectionNumber(selectionRef)).padStart(4, "0")}`;
  }

  function updateWordBand(selectionRef) {
    if (!wordlineAEl || !wordlineBEl || !wordtrackEl) return;
    const code = formatSelectionCode(selectionRef || cfg.id || "seleccion_01");
    const unit = `SELECCIÓN REFERENCIOTECA / ${code} /`;

    // SELECCION_START: cálculo dinámico del loop para evitar cortes del marquee
    const minLineWidth = Math.max(window.innerWidth * 1.5, 1800);
    let repeatCount = 8;
    let lineWidth = 0;
    while (repeatCount <= 40) {
      const text = Array(repeatCount).fill(unit).join(" ");
      wordlineAEl.textContent = text;
      wordlineBEl.textContent = text;
      lineWidth = Math.ceil(wordlineAEl.getBoundingClientRect().width);
      if (lineWidth >= minLineWidth) break;
      repeatCount += 2;
    }
    wordtrackEl.style.setProperty("--seleccion-loop-width", `${Math.max(lineWidth, 1)}px`);

    // Reinicia animación para que tome el nuevo ancho sin saltos visuales.
    wordtrackEl.style.animation = "none";
    void wordtrackEl.offsetWidth;
    wordtrackEl.style.animation = "";
    // SELECCION_END: cálculo dinámico del loop para evitar cortes del marquee
  }

  function compareSelectionDesc(a, b) {
    return parseSelectionNumber(b) - parseSelectionNumber(a);
  }

  function uniqueAuthors(projects) {
    const authors = [];
    const seen = new Set();
    projects.forEach((project) => {
      const raw = String(project && project.autor || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      authors.push(raw);
    });
    return authors;
  }

  function cleanArea(areaValue) {
    return String(areaValue || "")
      .split(/[\/,|]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 2);
  }

  function archiveTagUrl(tag) {
    return `index.html?mode=filter&view=grid&tag=${encodeURIComponent(String(tag || "").trim())}`;
  }

  function normalizeOrientation(value) {
    const raw = String(value || "").toLowerCase().trim();
    if (raw === "v" || raw === "vertical" || raw === "portrait") return "v";
    if (raw === "sq" || raw === "square") return "sq";
    return "h";
  }

  function openModal(project) {
    if (!overlayEl || !modalImgEl || !modalTitleEl || !modalAuthorEl || !modalRoleEl || !modalNoteEl || !modalTagsEl || !modalLinkEl) return;
    modalImgEl.src = String(project.imagen || "");
    modalImgEl.alt = String(project.titulo || "Proyecto seleccionado");
    modalTitleEl.textContent = String(project.titulo || "Proyecto sin título");
    modalAuthorEl.textContent = String(project.autor || "Autor no informado");
    modalRoleEl.textContent = `Rol: ${String(project.rol || "No informado")}`;
    modalNoteEl.textContent = String(project.nota || "");
    modalLinkEl.href = String(project.url || "index.html");
    modalTagsEl.innerHTML = "";
    (Array.isArray(project.tags) ? project.tags.slice(0, 5) : []).forEach((tag) => {
      const chip = document.createElement("a");
      chip.className = "ref2d__chip";
      chip.textContent = String(tag);
      chip.href = archiveTagUrl(tag);
      modalTagsEl.appendChild(chip);
    });
    overlayEl.hidden = false;
    document.body.classList.add("is-modal-open");
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.hidden = true;
    document.body.classList.remove("is-modal-open");
  }

  if (modalCloseEl) modalCloseEl.addEventListener("click", closeModal);
  if (overlayEl) {
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayEl && !overlayEl.hidden) closeModal();
  });

  const bySelection = new Map();
  historical.forEach((project) => {
    const selectionRef = String(project && project.selectionRef || "").trim();
    if (!selectionRef) return;
    if (!bySelection.has(selectionRef)) bySelection.set(selectionRef, []);
    bySelection.get(selectionRef).push(project);
  });

  const selectionRefs = Array.from(bySelection.keys()).sort(compareSelectionDesc);
  const latestSelectionRef = selectionRefs[0] || String(cfg.id || "seleccion_01");
  const latestProjects = bySelection.get(latestSelectionRef) || [];

  titleEl.textContent = String(cfg.titulo || "Selección Referencioteca");
  descEl.textContent = String(cfg.descripcion || "");
  metaEl.textContent = `Cápsula actual: ${formatSelectionCode(latestSelectionRef)} · ${latestProjects.length} entradas destacadas`;
  frequencyEl.textContent = "";

  let activeCapsule = null;

  function renderCapsuleDetail(selectionRef) {
    if (!selectionRef) {
      capsuleDetailEl.innerHTML = "";
      return;
    }

    const projects = bySelection.get(selectionRef) || [];
    const authors = uniqueAuthors(projects);
    const code = formatSelectionCode(selectionRef);

    const fragment = document.createDocumentFragment();
    const title = document.createElement("p");
    title.className = "seleccion__capsule-detail-title";
    title.textContent = `Destacados ${code}`;
    fragment.appendChild(title);

    if (!authors.length) {
      const empty = document.createElement("p");
      empty.className = "seleccion__capsule-empty";
      empty.textContent = "Sin nombres destacados cargados.";
      fragment.appendChild(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "seleccion__capsule-names";
      authors.forEach((author) => {
        const item = document.createElement("li");
        item.className = "seleccion__capsule-name";
        item.textContent = author;
        list.appendChild(item);
      });
      fragment.appendChild(list);
    }

    capsuleDetailEl.innerHTML = "";
    capsuleDetailEl.appendChild(fragment);
  }

  function setActiveCapsule(selectionRef, button) {
    const allButtons = capsulesEl.querySelectorAll(".seleccion__capsule-btn");
    allButtons.forEach((btn) => btn.classList.remove("is-active"));

    if (!selectionRef || activeCapsule === selectionRef) {
      activeCapsule = null;
      renderCapsuleDetail(null);
      return;
    }

    activeCapsule = selectionRef;
    if (button) button.classList.add("is-active");
    renderCapsuleDetail(selectionRef);
  }

  if (!selectionRefs.length) {
    capsulesEl.innerHTML = '<p class="seleccion__empty">No hay selecciones históricas todavía.</p>';
  } else {
    const capsuleFragment = document.createDocumentFragment();
    selectionRefs.forEach((selectionRef, index) => {
      const button = document.createElement("button");
      button.className = "seleccion__capsule-btn";
      button.type = "button";
      button.textContent = formatSelectionCode(selectionRef);
      button.setAttribute("aria-label", `Ver destacados de Selección ${formatSelectionCode(selectionRef)}`);
      button.addEventListener("click", function () {
        setActiveCapsule(selectionRef, button);
      });
      capsuleFragment.appendChild(button);
      if (index === 0) setTimeout(() => setActiveCapsule(selectionRef, button), 0);
    });
    capsulesEl.innerHTML = "";
    capsulesEl.appendChild(capsuleFragment);
  }

  function renderRightColumn(selectionRef) {
    const projects = bySelection.get(selectionRef) || [];
    rightTitleEl.textContent = `Selección ${formatSelectionCode(selectionRef)} · ${projects.length} entradas`;

    if (!projects.length) {
      gridEl.innerHTML = '<p class="seleccion__empty">No hay proyectos para mostrar en esta cápsula.</p>';
      return;
    }

    const gridFragment = document.createDocumentFragment();
    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = `ref2d__view-card is-${normalizeOrientation(project.orientation)}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Abrir detalle de ${String(project.titulo || "Proyecto")}`);

      const figure = document.createElement("figure");
      figure.className = "ref2d__view-card-figure";

      const image = document.createElement("img");
      image.loading = "lazy";
      image.decoding = "async";
      image.src = String(project.imagen || "");
      image.alt = String(project.titulo || "Proyecto seleccionado");
      figure.appendChild(image);

      const content = document.createElement("div");
      content.className = "ref2d__view-card-body";

      const head = document.createElement("div");
      head.className = "ref2d__view-card-head";

      const title = document.createElement("h3");
      title.textContent = String(project.titulo || "Proyecto sin título");

      const authorText = document.createElement("p");
      authorText.textContent = String(project.autor || "Autor no informado");

      const roleText = document.createElement("p");
      roleText.className = "ref2d__view-card-role";
      roleText.textContent = `Rol: ${String(project.rol || "No informado")}`;

      head.appendChild(title);
      head.appendChild(authorText);
      head.appendChild(roleText);

      const tagsWrap = document.createElement("div");
      tagsWrap.className = "ref2d__view-card-tags";
      const tagSource = Array.isArray(project.tags) && project.tags.length
        ? project.tags.slice(0, 4)
        : cleanArea(project.area);
      tagSource.forEach((tag) => {
        const chip = document.createElement("a");
        chip.className = "ref2d__chip";
        chip.textContent = String(tag);
        chip.href = archiveTagUrl(tag);
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = chip.href;
        });
        tagsWrap.appendChild(chip);
      });

      content.appendChild(figure);
      content.appendChild(head);
      content.appendChild(tagsWrap);
      card.appendChild(content);
      card.addEventListener("click", () => openModal(project));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(project);
        }
      });
      gridFragment.appendChild(card);
    });

    gridEl.innerHTML = "";
    gridEl.appendChild(gridFragment);
  }

  renderRightColumn(latestSelectionRef);
  updateWordBand(latestSelectionRef);

  const originalSetActiveCapsule = setActiveCapsule;
  setActiveCapsule = function (selectionRef, button) {
    originalSetActiveCapsule(selectionRef, button);
    if (!selectionRef || activeCapsule === null) {
      renderRightColumn(latestSelectionRef);
      updateWordBand(latestSelectionRef);
      return;
    }
    renderRightColumn(selectionRef);
    updateWordBand(selectionRef);
  };

  // SELECCION_START: mantener marquee correcto ante resize
  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      updateWordBand(activeCapsule || latestSelectionRef);
    }, 120);
  });
  // SELECCION_END: mantener marquee correcto ante resize
})();
/* SELECCION_END: cápsulas históricas + grilla vigente (lógica simple) */
