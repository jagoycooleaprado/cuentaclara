# CuentaClara

Sitio estático de calculadoras para Chile (sueldo líquido, finiquito, honorarios, dividendo, horas extras, impuesto único, comisiones AFP, UF/UTM/dólar). Se monetiza con AdSense y enlaces de afiliados, y crece por SEO.

## Comandos

```bash
node build.js              # genera la carpeta docs/ (lo que se publica)
node serve.js              # prueba local en http://localhost:4173
node tests/core.test.js    # tests del motor de cálculo
```

## Para publicar (gratis)

1. Compra un dominio .cl en [nic.cl](https://www.nic.cl) (~$10.000/año) y cámbialo en `config.js` (`domain`, `contactEmail`).
2. `node build.js`
3. Sube la carpeta `docs/` a **Cloudflare Pages** o **Netlify** (arrastrar y soltar) y conecta el dominio.
4. Registra el sitio en Google Search Console y envía `sitemap.xml`.

## Para ganar dinero

- **AdSense:** cuando te aprueben, pon `adsense.client` y los IDs de bloque en `config.js` y vuelve a ejecutar `node build.js`. También se genera `ads.txt`.
- **Afiliados / leads:** pon las URLs en `affiliates` de `config.js`; cada calculadora muestra su caja solo si hay URL. Los que mejor pagan: hipotecario (corredores y comparadores), abogados laborales (finiquito), software para independientes (honorarios).
- **Analítica:** `gaId` con un ID de Google Analytics 4.

## Mantenimiento

- **Cada enero:** revisar en `assets/calc-core.js` los topes imponibles (`topeImponibleUF`, `topeCesantiaUF`), el sueldo mínimo y la retención de honorarios; subir el año en `config.js`.
- **Cuando cambie:** comisiones AFP (`afp`), tramos del impuesto (están en UTM y no cambian salvo reforma).
- UF, UTM y dólar se leen en vivo de mindicador.cl; los valores de `calc-core.js` son solo respaldo.
- Después de cualquier cambio: `node tests/core.test.js && node build.js` y volver a subir `docs/`.
