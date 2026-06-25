# 🎯 conAI — Manual de marca

> **Tienda de descuento estilo Temu chileno con sello tech (IA).**
> Este documento es el norte de identidad. Cualquier cambio de diseño, copy o
> feature se contrasta contra estas decisiones antes de aplicarse.

Última actualización: Junio 2026.

---

## 1. Identidad

**conAI es una tienda de descuento agresiva, hecha en Chile, con tecnología (IA) como diferenciador.**

- **NO somos:** Apple-premium, Casaideas-curaduría, "tienda elegante minimalista".
- **SÍ somos:** marketplace de oferta tipo Temu/AliExpress, pero chileno y con sello tech.
- **Cliente objetivo:** cazadores de descuento que quieren confianza chilena (Transbank, despacho local, soporte en español) y aprovechan el sello tech (chatbot IA, recomendaciones).
- **Lo que vendemos de verdad:** ofertas reales sobre productos rebajados. Punto. Todo lo demás (IA, despacho local, devoluciones) son ventajas que **suman** sobre eso.

**Test rápido:** ante cualquier decisión, pregunto "¿esto suma a tienda de descuento agresiva chilena con IA, o lo contradice?". Si suma, va. Si contradice, fuera.

---

## 2. Paleta de colores

**Sistema híbrido: cada color tiene un trabajo específico.**

| Uso                           | Color              | Hex                   |
| ----------------------------- | ------------------ | --------------------- |
| Marca, navegación, "tech", IA | **Indigo**         | `#6366f1`             |
| Acento de marca, gradients    | **Celeste**        | `#38bdf8`             |
| Oferta, descuento, urgencia   | **Rojo**           | `#dc2626` / `#ef4444` |
| Energía, atención, badges     | **Naranja**        | `#f97316` / `#fb923c` |
| Confianza, ahorro, "OK"       | **Verde**          | `#16a34a`             |
| Premium, ofertas top          | **Amarillo cobre** | `#f59e0b`             |

**Regla de oro de los colores:**

- Cuando ves **indigo** = info de marca o navegación.
- Cuando ves **naranja/rojo** = oferta o urgencia.
- Nunca uses indigo para un precio rebajado. Nunca uses rojo para el logo.

**Color cobre (`#c2703d`)** queda para el acento del logo "AI" y temas premium puntuales (badge "TOP", "PREMIUM"). NO se usa como color de oferta.

---

## 3. Tipografía

**Fuente única: Manrope (Google Fonts).**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

Pesos a usar:

- **400 (Regular):** texto largo, descripciones.
- **500 (Medium):** sub-textos, etiquetas.
- **600 (SemiBold):** texto destacado, navegación.
- **700 (Bold):** títulos secundarios, botones.
- **800 (ExtraBold):** títulos principales, precios, montos de descuento.

**Por qué Manrope y no Inter ni Poppins:**

- Inter está sobre-usada en todas partes (se ve "genérica").
- Poppins es la marca de plantilla por excelencia (se ve "plantillada").
- Manrope es moderna, con personalidad amigable (letras redondas) y poco común. Te diferencia.

---

## 4. Tono de voz

**Sello propio, no plantilla.**

Reglas:

- Habla **en directo y corto** (tipo chileno conversacional, no formal).
- Usa **verbos de acción** ("lo quiero", "ya está", "vamos").
- Evita frases genéricas tipo "nuestra promesa", "lo que todos compran".
- Cuando puedas, **juega con la marca** ("conAI" se presta para juegos: "compra conAI", "con AI te ahorras").

**Glosario de microcopy (úsalo siempre):**

| Antes (genérico)               | Ahora (conAI)                                     |
| ------------------------------ | ------------------------------------------------- |
| Agregar al carrito             | **+ Lo quiero**                                   |
| Comprar ahora                  | **Llévatelo**                                     |
| Lo que todos están comprando   | **Lo que está volando**                           |
| Tecnología que acaba de llegar | **Recién aterrizó**                               |
| Nuestra promesa                | **Lo que te aseguro**                             |
| Tu compra, segura              | **Compra tranqui**                                |
| Inicia sesión                  | **Entrar**                                        |
| Crea tu cuenta                 | **Soy nuevo aquí**                                |
| Tu carrito está vacío          | **Aquí guardas lo que te gusta. Vamos a buscar.** |
| Algo salió mal                 | **Algo se nos cruzó. Vamos de nuevo.**            |
| Pedido confirmado              | **Listo. Lo estamos preparando.**                 |

**Slogan candidato:** _"Tecnología buena, sin pagar de más."_

---

## 5. Tratamiento de descuentos

**Estilo: orgulloso del descuento (estilo AliExpress).**

Estructura visual del precio (en tarjeta de producto):

```
$390.000  [−26% OFF]      ← precio final ROJO grande + badge NARANJA
$526.500                  ← precio original tachado, más chico, gris
```

- Precio final: **rojo `#dc2626`**, peso **800**, tamaño grande.
- Badge "−X% OFF": **naranja `#f97316`**, redondeado, al lado del precio.
- Precio original: tachado, gris, peso 500, más chico.
- **No se usa** "Ahorras $X" como línea adicional (queda recargado).

**El descuento es la estrella, no la complicación.**

---

## 6. Flash Sale y promociones

**Sistema: fecha real con rotación semanal.**

Reglas:

- El contador del Flash Sale **termina de verdad** en una fecha concreta (ej. domingo 23:59).
- Cuando termina, **arranca uno nuevo con código distinto** (CONAI20 → CONAI21 → CONAI22…).
- Nunca un contador se reinicia solo al llegar a 0.
- Los códigos de cupón tienen fecha de vencimiento en BD.

**Rotaciones sugeridas (semanales):**

- **Cyber Lunes:** descuento adicional en tech.
- **Cyber Semana:** -20% en todo el sitio.
- **Last Chance Friday:** últimas horas, descuento alto.
- **Weekend Drop:** novedades en fin de semana.

Cada rotación tiene su **nombre, color, código y fecha**. Nada inventado, todo en calendario.

---

## 7. Urgencia (qué sí, qué no)

**Sistema: honestas + basadas en data real.**

### ✅ Sí usamos:

- **Flash Sale con fecha real** (visible en header).
- **Etiqueta "⭐ Más vendido"** SOLO si `review_count` está en el top de la categoría.
- **Etiqueta "🆕 Nuevo"** SOLO si el producto se agregó hace ≤ 30 días.
- **"Solo quedan X"** SOLO si el campo `stock` ≤ 5 (data real).
- **"Termina en X días"** en cupones con fecha real.

### ❌ NO usamos:

- Contadores que se reinician solos.
- "127 personas viendo ahora" inventado.
- Popups "Juan compró un X hace 3 min" si no son compras reales.
- Precios "originales" inflados para que el descuento parezca mayor.
- Etiqueta "TOP" puesta a productos al azar para vender.

**Regla de oro de la urgencia:** si te quitan el botón de "comprar ahora", ¿la urgencia sigue siendo verdadera? Si sí, va. Si no, fuera.

---

## 8. Sello chileno

**Sistema: presente pero no protagonista.**

Tu identidad chilena se muestra en:

- **Banner permanente** (en header o sobre productos):
  > `🇨🇱 Pago con Transbank · Despacho 24-48h · Soporte en español`
- **Footer:** "Hecho en Chile" + dirección + métodos de pago locales.
- **Página de pago:** logo Transbank visible, "Pago seguro chileno".

**NO hacemos:**

- Eslogan "LA TIENDA CHILENA" como mensaje principal.
- Modismos chilenos pesados ("po", "weón") que pueden incomodar.
- Bandera gigante en todas las pantallas.

**SÍ hacemos:**

- Bandera 🇨🇱 chiquita en banner de confianza.
- Mención de Transbank, Chilexpress/Starken donde corresponde.
- Lenguaje neutro chileno: cercano pero entendible para todo Latinoamérica si más adelante exportamos.

---

## 9. Componentes clave (resumen visual)

### Header / Navbar

- Logo "con**AI**" (indigo + cobre).
- Buscador grande (no chico) en el centro.
- Íconos: favoritos, carrito (con badge), modo oscuro.
- Banner debajo: 🇨🇱 Pago Transbank · Envío 24-48h.

### Hero móvil (decidido, ya implementado)

- Tarjeta indigo→celeste con título "Hasta −X% OFF" + 2 productos reales con precio.
- Fila de 5 atajos (Envío gratis, Cupones, Más vendidos, Nuevos, Categorías).

### Hero desktop (PENDIENTE de rediseño con el manual)

### Tarjeta de producto

- Imagen cuadrada con badge `-26% OFF` (rojo) arriba a la derecha.
- Badge `⭐ Más vendido` (cobre) arriba a la izquierda, SOLO si corresponde.
- Nombre del producto en bold.
- Precio final **rojo grande** + precio original tachado abajo.
- Botón **+ Lo quiero** (gradient indigo→celeste).

### Botones

- **Acción principal** (comprar, agregar): gradient `linear-gradient(135deg, #6366f1, #38bdf8)`, blanco, redondeado.
- **Acción urgente** (oferta, flash): gradient `linear-gradient(135deg, #ef4444, #f97316)`, blanco.
- **Acción secundaria** (cancelar, ver más): borde gris, texto gris-azul, sin fondo.

---

## 10. Glosario de feature flags futuras

Cuando agreguemos features, encajan así:

- **Chatbot IA:** indigo. Se llama "conAI" y se trata de tú.
- **Recomendaciones IA:** indigo. Etiqueta "Hecho con IA" en cobre.
- **Cupones:** naranja (es oferta).
- **Programa de referidos:** verde (es ahorro).
- **Tracking de pedidos:** azul-celeste (es info).
- **Reseñas:** amarillo (5 estrellas).

---

## Historial de decisiones

- **Junio 2026:** primera versión del manual. Identidad consolidada después de 4h de definiciones con el equipo.
