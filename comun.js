// Código compartido por los 5 prototipos de concesionaria (Deploy).
// Personalización por link: ?n=Nombre de la agencia&z=Localidad
// Stock propio de la agencia (opcional): ?d=slug  ->  ../datos/slug.json
(() => {
  const WA = "5491144091981";
  const q = new URLSearchParams(location.search);
  const limpiar = (v, max) => (v || "").replace(/[<>]/g, "").trim().slice(0, max);
  const nombre = limpiar(q.get("n"), 60);
  const zona = limpiar(q.get("z"), 40);
  const slug = (q.get("d") || "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);

  const DEMO = window.DEMO = {
    nombre: nombre || document.body.dataset.nombreDemo || "Tu Agencia",
    zona: zona || document.body.dataset.zonaDemo || "Zona Sur",
    personalizado: !!nombre,
    stockPropio: false,
    autos: window.AUTOS || [],
    foto: (a) => /^https?:/.test(a.img) ? a.img : "../fotos/" + a.img,
    usd: (p) => "USD " + Math.round(p * 1000).toLocaleString("es-AR"),
    precio: (a) => a.precio || (a.p ? "USD " + Math.round(a.p * 1000).toLocaleString("es-AR") : "Consultar"),
    km: (a) => a.km === undefined || a.km === null || a.km === "" ? "" : (String(a.km) === "0" ? "0 km" : a.km + " km"),
    esc: (s) => String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]),
    tipo: (t) => ({ hatch: "Hatchback", sedan: "Sedán", suv: "SUV", pickup: "Pick-up" })[t] || t,
    wa: (texto) => window.open(`https://wa.me/${WA}?text=${encodeURIComponent("[DEMO] " + texto)}`, "_blank", "noopener")
  };

  // Textos personalizados: cualquier elemento con data-nombre / data-zona
  const pintarTextos = () => {
    document.querySelectorAll("[data-nombre]").forEach(el => {
      el.textContent = (el.dataset.nombre || "{n}").replace("{n}", DEMO.nombre).replace("{z}", DEMO.zona);
    });
    document.querySelectorAll("[data-zona]").forEach(el => {
      el.textContent = (el.dataset.zona || "{z}").replace("{z}", DEMO.zona).replace("{n}", DEMO.nombre);
    });
    document.title = DEMO.nombre + " · Prototipo por Deploy";
    const banda = document.getElementById("banda-demo");
    if (banda) {
      banda.textContent = DEMO.personalizado
        ? `Prototipo armado para ${DEMO.nombre} por Deploy · ${DEMO.stockPropio ? "con autos de su web" : "autos de ejemplo"} · `
        : "Prototipo de ejemplo hecho por Deploy · autos y precios de ejemplo · ";
      const a = document.createElement("a");
      a.href = "#"; a.textContent = DEMO.personalizado ? "Quiero esta web" : "¿Querés una así?";
      a.dataset.wa = DEMO.personalizado ? `Hola! Soy de ${DEMO.nombre}, vi el prototipo que armaste y quiero saber más` : "Hola! Vi la demo de concesionaria y quiero una web así";
      banda.appendChild(a);
    }
  };

  // WhatsApp: cualquier elemento con data-wa abre el chat con ese texto ({n} = nombre de la agencia)
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-wa]");
    if (!el) return;
    e.preventDefault();
    DEMO.wa(el.dataset.wa.replace("{n}", DEMO.nombre));
  });

  // Créditos de fotos (licencias Creative Commons)
  const pintarCreditos = () => {
    const box = document.getElementById("creditos");
    if (!box) return;
    const lista = DEMO.stockPropio
      ? `<p>Fotos tomadas de la web de ${DEMO.nombre}, solo para mostrarles este prototipo.</p>`
      : "<p>Fotos reales de Wikimedia Commons, con licencias libres:</p><ul>" + DEMO.autos.map(a =>
          `<li>${a.m.replace(/</g, "")}: <a href="${a.fuente}" target="_blank" rel="noopener">${(a.autor || "autor").replace(/</g, "")}</a> (${a.lic})</li>`).join("") + "</ul>";
    box.innerHTML = `<details><summary>Créditos de las fotos</summary>${lista}</details>`;
  };

  const listo = () => {
    pintarTextos();
    pintarCreditos();
    document.dispatchEvent(new CustomEvent("autos-listos", { detail: DEMO }));
  };

  // Aparición suave al hacer scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add("visto")), { threshold: .12 }) : null;
  DEMO.revelar = (root = document) => root.querySelectorAll(".reveal:not(.visto)").forEach(el => io ? io.observe(el) : el.classList.add("visto"));

  const arrancar = () => {
    if (!slug) return listo();
    fetch(`../datos/${slug}.json`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        if (Array.isArray(d.autos) && d.autos.length >= 3) { DEMO.autos = d.autos; DEMO.stockPropio = true; }
        if (!nombre && d.nombre) { DEMO.nombre = d.nombre; DEMO.personalizado = true; }
        if (!zona && d.zona) DEMO.zona = d.zona;
      })
      .catch(() => {})
      .finally(listo);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})();
