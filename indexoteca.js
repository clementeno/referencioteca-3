/**
 * Indexoteca — Filtro, orden, filas clickeables, preview drawer.
 * Buscador y contador viven en toolbar (no en header).
 */

const studios = [
  { name: "Felicidad Pública", url: "https://felicidadpublica.cl", field: "Dirección Creativa / Branding / Editorial", city: "Santiago, Chile", tags: ["branding", "identidad", "editorial"], previews: ["felicidad-1", "felicidad-2", "felicidad-3", "felicidad-4"] },
  { name: "Otros Pérez", url: "http://otrosperez.com/", field: "Branding / Editorial / Campañas", city: "Santiago, Chile", tags: ["identidad", "editorial", "gráfico"], previews: ["otrosperez-1", "otrosperez-2", "otrosperez-3"] },
  { name: "Gaggeroworks", url: "http://gaggeroworks.co.uk/", field: "Dirección Creativa / Diseño Gráfico / Museografía", city: "London, UK", tags: ["direction", "graphic", "art"], previews: ["gaggero-1", "gaggero-2", "gaggero-3", "gaggero-4"] },
  { name: "Estudio Postal", url: "https://www.estudiopostal.cl/", field: "Branding / Packaging / Corporativo / Editorial", city: "Santiago, Chile", tags: ["branding", "packaging", "identidad"], previews: ["postal-1", "postal-2", "postal-3"] },
  { name: "10:10", url: "https://www.diezdiez.com/", field: "Digital / Web", city: "Santiago, Chile", tags: ["digital", "web", "experiencia"], previews: ["diezdiez-1", "diezdiez-2", "diezdiez-3", "diezdiez-4"] },
  { name: "Design Systems International", url: "https://designsystems.international/", field: "Design Systems / Digital / Multidisciplinario", city: "International", tags: ["design systems", "digital", "product"], previews: ["dsi-1", "dsi-2", "dsi-3"] },
  { name: "searchsystem", url: "#", field: "Digital / Technology", city: "Santiago, Chile", tags: ["digital", "tech", "systems"], previews: ["search-1", "search-2", "search-3"] },
  { name: "IV Studio", url: "https://www.ivestudio.com", field: "Branding / Dirección Creativa", city: "Santiago, Chile", tags: ["dirección de arte", "branding", "gráfico"], previews: ["iv-1.avif", "iv-2.avif", "iv-3.avif"] },
  { name: "Almabrands", url: "https://www.almabrands.com", field: "Consultoría Estratégica / Branding / Cultura de Marca", city: "Santiago, Chile", tags: ["branding", "estrategia", "consultoría"], previews: [] },
{ name: "ANTS", url: "https://ants.cl", field: "Branding / Señalética / Espacios", city: "Santiago, Chile", tags: ["branding", "señalética", "espacios"], previews: [] },
{ name: "BAFE Studio", url: "https://bafestudio.com", field: "Branding / Diseño Gráfico / Editorial", city: "Santiago, Chile", tags: ["branding", "editorial", "identidad"], previews: [] },
{ name: "Bang Creative", url: "https://bang.cl", field: "Branding / Estrategia / Diseño", city: "Santiago, Chile", tags: ["branding", "estrategia", "identidad"], previews: [] },
{ name: "Baobab", url: "https://baobabdiseno.com", field: "Diseño / Branding / Comunicación", city: "Santiago, Chile", tags: ["branding", "identidad", "comunicación"], previews: [] },
{ name: "BBK", url: "https://bbkgroup.com", field: "Branding / Estrategia / Experiencia de Marca", city: "Santiago, Chile", tags: ["branding", "estrategia", "experiencia"], previews: [] },
{ name: "BITPLAY", url: "https://bitplay.cl", field: "Digital / Interacción / Tecnología", city: "Santiago, Chile", tags: ["digital", "interacción", "tecnología"], previews: [] },
{ name: "BlancaEstudio", url: "https://blancaestudio.cl", field: "Diseño / Branding / Editorial", city: "Santiago, Chile", tags: ["branding", "editorial", "identidad"], previews: [] },
{ name: "Bonnet Estudio", url: "https://bonnet.cl", field: "Branding / Packaging / Diseño", city: "Santiago, Chile", tags: ["branding", "packaging", "identidad"], previews: [] },
{ name: "Buendía", url: "https://buendia.cl", field: "Branding / Diseño Digital", city: "Santiago, Chile", tags: ["branding", "digital", "web"], previews: [] },
{ name: "Caja Muebles", url: "https://cajamuebles.cl", field: "Diseño Industrial / Mobiliario", city: "Santiago, Chile", tags: ["industrial", "mobiliario", "producto"], previews: [] },
{ name: "CINCEL", url: "https://cincel.cl", field: "Diseño Editorial / Publicaciones", city: "Santiago, Chile", tags: ["editorial", "publicaciones", "libros"], previews: [] },
{ name: "CQ", url: "https://cq.cl", field: "Branding / Diseño / Comunicación", city: "Santiago, Chile", tags: ["branding", "identidad", "comunicación"], previews: [] },
{ name: "DA", url: "https://da.cl", field: "Dirección de Arte / Diseño Gráfico", city: "Santiago, Chile", tags: ["dirección de arte", "gráfico", "branding"], previews: [] },
{ name: "Diegonciox", url: "https://diegonciox.com", field: "Diseño / Arte / Gráfico", city: "Chile", tags: ["gráfico", "arte", "experimental"], previews: [] },
{ name: "Doblegiro", url: "https://doblegiro.cl", field: "Branding / Estrategia / Diseño", city: "Santiago, Chile", tags: ["branding", "estrategia", "identidad"], previews: [] },
{ name: "Estudio MR", url: "https://estudiomr.cl", field: "Arquitectura / Diseño / Espacios", city: "Santiago, Chile", tags: ["arquitectura", "espacios", "diseño"], previews: [] },
{ name: "Freaktools", url: "https://freaktools.cl", field: "Diseño / Tecnología / Interacción", city: "Santiago, Chile", tags: ["digital", "interacción", "tecnología"], previews: [] },
{ name: "FutureBrand", url: "https://futurebrand.com", field: "Brand Strategy / Branding", city: "Santiago, Chile", tags: ["branding", "estrategia", "consultoría"], previews: [] },
{ name: "Gorila Amarillo", url: "https://gorilaamarillo.cl", field: "Branding / Comunicación / Diseño", city: "Santiago, Chile", tags: ["branding", "comunicación", "identidad"], previews: [] },
{ name: "Grupo Oxígeno", url: "https://grupoxigeno.cl", field: "Branding / Estrategia / Diseño", city: "Santiago, Chile", tags: ["branding", "estrategia", "identidad"], previews: [] },
{ name: "Humano", url: "https://somoshumano.cl", field: "Branding / Estrategia / Comunicación", city: "Santiago, Chile", tags: ["branding", "estrategia", "comunicación"], previews: [] },
{ name: "Infografías.cl", url: "https://infografias.cl", field: "Infografía / Visualización / Diseño", city: "Santiago, Chile", tags: ["infografía", "visualización", "datos"], previews: [] },
{ name: "Kathryn Gillmore", url: "https://kathryngillmore.com", field: "Diseño / Dirección de Arte", city: "Chile", tags: ["dirección de arte", "branding", "editorial"], previews: [] },
{ name: "Kondimento", url: "https://kondimento.cl", field: "Branding / Diseño / Comunicación", city: "Santiago, Chile", tags: ["branding", "identidad", "estrategia"], previews: [] },
{ name: "Latinotype", url: "https://latinotype.com", field: "Tipografía / Diseño Tipográfico", city: "Santiago, Chile", tags: ["tipografía", "type design", "fonts"], previews: [] },
{ name: "Lebran", url: "https://lebran.cl", field: "Branding / Estrategia / Diseño", city: "Santiago, Chile", tags: ["branding", "estrategia", "identidad"], previews: [] },
{ name: "Leyton Arquitectos", url: "https://leytonarquitectos.cl", field: "Arquitectura / Espacios / Diseño", city: "Santiago, Chile", tags: ["arquitectura", "espacios", "diseño"], previews: [] },
{ name: "Litio Diseño", url: "https://litiodiseno.cl", field: "Diseño Industrial / Producto", city: "Chile", tags: ["industrial", "producto", "innovación"], previews: [] },
{ name: "Mandarina", url: "https://mandarina.cl", field: "Branding / Comunicación / Diseño", city: "Santiago, Chile", tags: ["branding", "comunicación", "identidad"], previews: [] },
{ name: "MMÍA Studio", url: "https://mmia.studio", field: "Arquitectura / Diseño / Investigación", city: "Chile", tags: ["arquitectura", "investigación", "espacios"], previews: [] },
{ name: "Medular", url: "https://medular.cl", field: "Diseño / Branding / Comunicación", city: "Santiago, Chile", tags: ["branding", "identidad", "estrategia"], previews: [] },
{ name: "Nueve Design Studio", url: "https://nuevedesignstudio.cl", field: "Branding / Diseño / Comunicación", city: "Chile", tags: ["branding", "identidad", "gráfico"], previews: [] },
{ name: "OARQUITECTOS", url: "https://oarquitectos.cl", field: "Arquitectura / Espacios / Diseño", city: "Chile", tags: ["arquitectura", "espacios", "diseño"], previews: [] },
{ name: "OPENART", url: "https://openart.cl", field: "Arte / Diseño / Cultura", city: "Chile", tags: ["arte", "cultura", "diseño"], previews: [] },
{ name: "Orlando Gatica", url: "https://orlandogatica.com", field: "Dirección de Arte / Diseño Gráfico", city: "Chile", tags: ["dirección de arte", "branding", "editorial"], previews: [] },
{ name: "DEO", url: "https://deo.cl", field: "Branding / Identidad / Diseño", city: "Chile", tags: ["branding", "identidad", "estrategia"], previews: [] },
{ name: "Visualógica", url: "https://visualogica.com", field: "Comunicación / Diseño / Estrategia", city: "Chile", tags: ["branding", "comunicación", "diseño"], previews: [] },
{ name: "Siente Cinco", url: "https://branding.sientecinco.cl", field: "Branding / Estrategia / Arquitectura de Marca", city: "Chile", tags: ["branding", "estrategia", "identidad"], previews: [] },
{ name: "Draft", url: "https://draft.cl", field: "Branding / Identidad Visual / Diseño", city: "Chile", tags: ["branding", "identidad", "gráfico"], previews: [] },
{ name: "SUMO", url: "https://www.sumo.cl", field: "Museografía / Espacios / Diseño", city: "Santiago, Chile", tags: ["museografía", "espacios", "exhibiciones"], previews: [] },
  { name: "JVD", url: "https://www.instagram.com/jvd_estudio/?hl=es", field: "Dirección de arte / Arquitectura", city: "Santiago, Chile", tags: ["dirección de arte", "arquitectura", "gráfico"], previews: ["jvd-1", "jvd-2", "jvd-3"] },
];

let filtered = [...studios];
let sortKey = "name";
let sortDir = 1;

const tableBody = document.getElementById("table-body");
const searchInput = document.getElementById("search-input");
const countEl = document.getElementById("count-el");

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function matchStudio(studio, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return [studio.name, studio.field, studio.city, (studio.tags || []).join(" ")].
    some(s => (s || "").toLowerCase().includes(lower));
}

function compare(a, b) {
  const va = (a[sortKey] ?? "").toString().toLowerCase();
  const vb = (b[sortKey] ?? "").toString().toLowerCase();
  if (va < vb) return -1 * sortDir;
  if (va > vb) return 1 * sortDir;
  return 0;
}

function getPreviewUrl(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
}

function render() {
  filtered.sort(compare);
  countEl.textContent = `${filtered.length} items`;

  document.querySelectorAll(".idx-table th[data-sort]").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.sort === sortKey) th.classList.add(sortDir === 1 ? "sort-asc" : "sort-desc");
  });

  let html = "";
  filtered.forEach((studio, i) => {
    const linkLabel = studio.url === "#" ? "—" : "→";
    const linkCell = studio.url === "#"
      ? `<a href="#" onclick="event.preventDefault();event.stopPropagation();">${linkLabel}</a>`
      : `<a href="${escapeHtml(studio.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation();">${linkLabel}</a>`;
    const thumbs = (studio.previews || [])
      .map((seed) => `<img class="drawer-thumb" src="${getPreviewUrl(seed)}" alt="" loading="lazy">`)
      .join("");

    html += `
      <tr class="data-row" tabindex="0" data-index="${i}" data-href="${escapeHtml(studio.url)}" role="button">
        <td class="col-name">${escapeHtml(studio.name)}</td>
        <td class="col-field">${escapeHtml(studio.field)}</td>
        <td class="col-city">${escapeHtml(studio.city)}</td>
        <td class="col-link">${linkCell}</td>
      </tr>
      <tr class="drawer-row" data-index="${i}" aria-hidden="true">
        <td colspan="4" class="drawer-cell">
          <div class="drawer-wrapper">
            <div class="drawer-inner">
              <div class="drawer-content">
                <div class="drawer-thumbs">${thumbs}</div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  tableBody.innerHTML = html;
  bindRowEvents();
}

function getDrawerRow(dataRow) {
  const idx = dataRow.dataset.index;
  return tableBody.querySelector(`tr.drawer-row[data-index="${idx}"]`);
}

function openDrawer(dataRow) {
  const drawerRow = getDrawerRow(dataRow);
  if (!drawerRow) return;
  const wrapper = drawerRow.querySelector(".drawer-wrapper");
  if (wrapper) {
    wrapper.classList.add("is-open");
    drawerRow.setAttribute("aria-hidden", "false");
  }
}

function closeDrawer(dataRow) {
  const drawerRow = getDrawerRow(dataRow);
  if (!drawerRow) return;
  const wrapper = drawerRow.querySelector(".drawer-wrapper");
  if (wrapper) {
    wrapper.classList.remove("is-open");
    drawerRow.setAttribute("aria-hidden", "true");
  }
}

function closeAllDrawers() {
  tableBody.querySelectorAll(".drawer-wrapper.is-open").forEach((w) => {
    w.classList.remove("is-open");
    const row = w.closest("tr.drawer-row");
    if (row) row.setAttribute("aria-hidden", "true");
  });
}

function bindRowEvents() {
  tableBody.querySelectorAll("tr.data-row").forEach((row) => {
    row.addEventListener("mouseenter", () => openDrawer(row));
    row.addEventListener("mouseleave", () => closeDrawer(row));
    row.addEventListener("focus", () => openDrawer(row));
    row.addEventListener("blur", (e) => {
      const next = e.relatedTarget;
      const drawer = getDrawerRow(row);
      if (!next || (!row.contains(next) && (!drawer || !drawer.contains(next)))) closeDrawer(row);
    });
    row.addEventListener("click", (e) => {
      if (e.target.closest("a[href]") && e.target.closest("a[href]").getAttribute("href") !== "#") return;
      const href = row.dataset.href;
      if (href && href !== "#") window.open(href, "_blank", "noopener");
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const href = row.dataset.href;
        if (href && href !== "#") window.open(href, "_blank", "noopener");
      }
    });
  });
  tableBody.querySelectorAll("tr.drawer-row").forEach((drawerRow) => {
    drawerRow.addEventListener("mouseenter", () => {
      const dataRow = tableBody.querySelector(`tr.data-row[data-index="${drawerRow.dataset.index}"]`);
      if (dataRow) openDrawer(dataRow);
    });
    drawerRow.addEventListener("mouseleave", () => {
      const dataRow = tableBody.querySelector(`tr.data-row[data-index="${drawerRow.dataset.index}"]`);
      if (dataRow) closeDrawer(dataRow);
    });
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  filtered = studios.filter((s) => matchStudio(s, q));
  render();
});

document.querySelectorAll(".idx-table th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    if (th.dataset.sort === sortKey) sortDir *= -1;
    else { sortKey = th.dataset.sort; sortDir = 1; }
    render();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDrawers();
});

filtered = [...studios];
render();
