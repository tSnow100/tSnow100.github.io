# PORTAFOLIO - Teo · FROSTFORGE

Portafolio de Teo, configurador y desarrollador de contenido para servidores de Minecraft: menús, estética, MythicMobs y mazmorras.

**Sitio:** https://tsnow100.github.io/

## Tecnologías

- HTML, CSS y JavaScript sin frameworks ni dependencias. No hay paso de compilación.
- Tipografías servidas desde el propio sitio: Clash Display y General Sans (Fontshare, licencia ITF Free Font) e IBM Plex Mono (SIL OFL).
- Imágenes en WebP, con variantes 480–1600 px para `srcset`. Las capturas pixel-art van sin pérdida.
- Vídeos alojados en YouTube (no listados), incrustados con `youtube-nocookie.com` solo al abrirlos.
- Publicación con GitHub Pages mediante GitHub Actions (`.github/workflows/pages.yml`).

## Funciones

- Tema oscuro (por defecto) y claro, con la preferencia guardada en el navegador.
- Inglés (por defecto) y español, con la preferencia guardada en el navegador.
- Galerías con visor accesible: teclado, foco atrapado y deslizamiento táctil.
- Nieve pixel-art original sobre las superficies oscuras; respeta "reducir movimiento".
- Diseño adaptable de 360 a 1920 px.

## Estructura

```
index.html          Página principal (textos en inglés)
404.html            Página de error
robots.txt          Rastreo y enlace al sitemap
sitemap.xml         Mapa del sitio
.nojekyll           Desactiva Jekyll en GitHub Pages
css/main.css        Tokens de diseño (temas claro y oscuro), @font-face y estilos
js/i18n.js          Traducciones al español y textos generados por JavaScript
js/main.js          Interacciones: visor, carrusel, mazmorras, acordeón, nieve, tema, idioma, menú
assets/fonts/       Tipografías WOFF2
assets/images/      Capturas, portadas y favicons
.github/workflows/  Despliegue en GitHub Pages
```

## Desarrollo local

Sirve la carpeta con cualquier servidor estático; no abras `index.html` con doble clic.

```powershell
npx serve .
```

Después abre `http://localhost:3000`.

## Editar contenido

- **Textos:** el HTML está en inglés. Cada texto traducible lleva `data-i18n`, `data-i18n-html` o `data-i18n-attr`, y su versión en español está en `js/i18n.js` con la misma clave.
- **Galerías:** las imágenes visibles están en `index.html` (`data-lb`, `data-src`). El archivo completo (imágenes extra y vídeos) está en `EXTRA`, dentro de `js/main.js`. Para añadir un vídeo, usa `yt('ID')`; el ID es lo que va después de `youtu.be/`.
- **Colores:** `css/main.css`. `:root` define el tema claro y `:root[data-theme="dark"]` el oscuro.
- **Seguridad:** `index.html` declara una Content-Security-Policy con el hash SHA-256 de su único script en línea. Si cambias ese script, recalcula el hash o el navegador no lo ejecutará.

## Publicar una actualización

```powershell
git add -A
git commit -m "Describe el cambio"
git push
```

Cada push a `main` ejecuta el workflow **Deploy to GitHub Pages**. El progreso se ve en la pestaña *Actions* del repositorio. GitHub Pages guarda en caché los archivos unos 10 minutos.

### Dominio propio (opcional)

1. Crea un archivo `CNAME` en la raíz con el dominio (por ejemplo, `teo.example.com`). El workflow lo publica.
2. Configura el DNS según la documentación de GitHub Pages y activa *Enforce HTTPS* en *Settings → Pages*.
3. Actualiza la URL en `index.html` (canonical, `og:url`, `og:image`, `twitter:image`), `robots.txt` y `sitemap.xml`.

---

© 2026 Teo. Todos los derechos reservados sobre las capturas y el contenido.
