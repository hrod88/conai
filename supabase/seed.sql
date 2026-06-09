-- ============================================================
-- conAI — Seed de productos iniciales
-- ============================================================

insert into products (name, description, price, category, icon, tag, stock, rating, review_count) values
-- SALUD
('Withings ScanWatch 2',     'Smartwatch con ECG, SpO2 y detección de fibrilación auricular.',            349.99, 'salud',     '❤️',  'bestseller', 15, 4.8, 312),
('Oura Ring Gen 3',          'Anillo de seguimiento de sueño, frecuencia cardíaca y temperatura.',        299.99, 'salud',     '😴',  'bestseller', 20, 4.7, 524),
('Withings Body Scan',       'Báscula con análisis de composición corporal y salud nerviosa.',            399.99, 'salud',     '🧬',  null,         10, 4.5, 188),
('Muse S Headband',          'Diadema de meditación con biofeedback cerebral en tiempo real.',            399.99, 'salud',     '🧘',  null,          8, 4.4, 143),
('Dexcom G7',                'Sensor continuo de glucosa con alertas y app inteligente.',                  89.99, 'salud',     '💊',  'nuevo',      50, 4.6, 287),
('Wellue O2Ring',            'Monitor de oxígeno en sangre y frecuencia cardíaca nocturna.',              169.99, 'salud',     '💙',  null,         18, 4.5, 201),
('Polar Vantage V3',         'Reloj deportivo con test de fitness y recuperación por IA.',                599.99, 'salud',     '🏃',  'bestseller', 12, 4.8, 445),
('Apollo Neuro Band',        'Wearable de vibración táctil que reduce estrés y mejora el foco.',          349.99, 'salud',     '🧠',  'descuento',  14, 4.3, 167),
-- BELLEZA
('HiMirror Mini X',          'Espejo inteligente con análisis de piel por IA y recomendaciones.',         199.99, 'belleza',   '🪞',  'bestseller', 22, 4.6, 398),
('FOREO LUNA 4',             'Limpiador facial con IA que adapta la intensidad a tu piel.',               219.99, 'belleza',   '🫧',  null,         16, 4.7, 521),
('Dyson Airwrap i.d.',       'Estilizador que ajusta el calor según tu tipo de cabello.',                 599.99, 'belleza',   '🪮',  'descuento',   9, 4.8, 632),
('NuFace Trinity+',          'Dispositivo de microcorriente facial que tonifica con IA adaptativa.',      339.99, 'belleza',   '💆',  null,         11, 4.5, 274),
('SkinAI Analyzer Pro',      'Escáner facial que crea rutina de skincare personalizada.',                  89.99, 'belleza',   '🔬',  'nuevo',      30, 4.4, 189),
-- HOGAR
('Roborock S8 MaxV',         'Robot aspirador con reconocimiento de objetos y mapeo 3D por IA.',          799.99, 'hogar',     '🤖',  'bestseller', 18, 4.8, 743),
('Nest Learning Thermostat', 'Termostato que aprende tu rutina y optimiza el consumo energético.',        249.99, 'hogar',     '🌡️',  null,         25, 4.7, 512),
('Arlo Ultra 2',             'Cámara 4K con detección inteligente de personas y vehículos.',              199.99, 'hogar',     '📷',  'descuento',  20, 4.5, 334),
('Eufy Smart Lock S330',     'Cerradura con reconocimiento facial y huella dactilar por IA.',             299.99, 'hogar',     '🔐',  'nuevo',      14, 4.6, 221),
('Sonos Era 300',            'Altavoz espacial con IA que adapta el sonido a la habitación.',             449.99, 'hogar',     '🎵',  null,         16, 4.7, 418),
-- WEARABLES
('Apple Watch Ultra 2',      'Smartwatch con detección de accidentes, ECG y temperatura corporal.',       799.99, 'wearables', '⌚',  'bestseller', 30, 4.9, 1240),
('Samsung Galaxy Ring',      'Anillo inteligente con seguimiento de salud y sueño por IA.',              399.99, 'wearables', '💍',  'nuevo',      20, 4.5, 287),
('Whoop 4.0 Band',           'Banda de fitness con IA de recuperación y análisis de strain.',            239.99, 'wearables', '🏋️',  'bestseller', 35, 4.7, 892),
('Garmin Fenix 7X',          'Reloj outdoor con mapas, IA de entrenamiento y batería solar.',            699.99, 'wearables', '🗺️',  null,         12, 4.8, 567),
('Ray-Ban Meta Glasses',     'Gafas inteligentes con asistente de IA integrado y cámara.',               299.99, 'wearables', '🕶️',  'nuevo',      18, 4.4, 312),
-- MASCOTAS
('Halo Collar 3',            'Collar GPS con valla virtual invisible entrenada por IA.',                  499.99, 'mascotas',  '🐾',  'bestseller', 14, 4.7, 423),
('Litter-Robot 4',           'Arenero automático con IA que monitorea la salud de tu gato.',             699.99, 'mascotas',  '🐱',  null,         10, 4.8, 634),
('Furbo 360 Dog Camera',     'Cámara giratoria con IA que sigue a tu perro y lanza premios.',            169.99, 'mascotas',  '🐶',  'descuento',  22, 4.6, 512),
('Petcube Bites 2',          'Cámara con IA que detecta ladridos y lanza premios automáticamente.',       99.99, 'mascotas',  '📡',  'nuevo',      28, 4.4, 287),
('Tractive GPS Dog 4',       'GPS en tiempo real con análisis de actividad y zonas seguras por IA.',      49.99, 'mascotas',  '🐕',  null,         40, 4.5, 398),
-- GADGETS
('DJI Mini 4 Pro',           'Drone con cámara 4K y evitación de obstáculos omnidireccional por IA.',   759.99, 'gadgets',   '🚁',  'bestseller', 15, 4.8, 678),
('Bambu Lab A1 Mini',        'Impresora 3D con calibración automática y detección de errores por IA.',   299.99, 'gadgets',   '🖨️',  'nuevo',      20, 4.7, 412),
('Plaud Note AI',            'Grabadora IA que transcribe y resume reuniones al instante.',              159.99, 'gadgets',   '📝',  'bestseller', 35, 4.6, 534),
('Elgato Wave DX',           'Micrófono con IA de filtrado de ruido ambiental en tiempo real.',          149.99, 'gadgets',   '🎙️',  null,         25, 4.5, 321),
('Timekettle WT2 Edge',      'Auriculares de traducción simultánea en 40 idiomas con IA.',              299.99, 'gadgets',   '🌐',  'descuento',  18, 4.3, 243);
