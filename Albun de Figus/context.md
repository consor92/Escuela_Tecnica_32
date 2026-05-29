# Álbum 32: Especificaciones Técnicas y de Diseño

## Estado del Proyecto
- **Fase:** Módulo 5 (Preparación).
- **Última Actualización:** Módulo 4 (Álbum Virtual 3D Premium) finalizado y pulido.

## 📓 Arquitectura del Álbum (StPageFlip)
- **Dimensiones:** Libro de 840x550px (Spreads fijos de 2 páginas de 420px).
- **Física del Libro:** 
    - Uso de `data-density="hard"` para hojas rígidas (efecto cartón premium).
    - Tiempo de volteo (`flippingTime`) ajustado a 1000ms para realismo.
    - Sincronización de Apertura: Tapa (Pág 0), Intro/Propiedad (Pág 1 - Izquierda), Salón de Honor (Pág 2 - Derecha).
- **Componentes Físicos:**
    - **Tapa y Contratapa:** Marrón Cuero Noble (`#452c1e`) con bordes dobles dorados.
    - **Papel:** Textura de fibra natural (`var(--paper)`) con bordes sutiles y sombras de lomo central.
    - **Lomo Dinámico:** Degradados en la unión central que simulan profundidad tridimensional.

## 📐 Layout y Grillas (Matrices Cuadradas)
- **Estabilización de Slots:** Forzado de columnas a 180px fijos para mantener proporciones en todas las páginas (especialmente en pág. 1, 4, 8, 13).
- **Matrices Reales:** Forzado de grillas mediante `!important` y clases específicas para evitar desbordamientos:
    - **6 Figuritas (3x2):** Matriz de 2 columnas con repetición de filas.
    - **4 Figuritas (2x2):** Matriz de 2 columnas equilibradas.
    - **1 Figurita:** Centrado absoluto con tamaño monumental (300px) en Salón de Honor.
- **Espaciado:** Gap de 20px entre slots estándar para una visualización aireada y profesional.

## 🖼️ Figuritas y Mosaicos
- **Diseño del Cromo:** 
    - **Zero Padding:** La imagen toca físicamente el marco de rareza (sin bordes blancos internos).
    - **Bordes Externos:** Sombra proyectada de 8px para simular volumen sobre el papel.
- **Lógica de Mosaicos:**
    - Paisajes de 2x2 y 1x2 con unión de pixel perfecto (sin gaps ni bordes redondeados internos).
    - **Etiquetas de Guía:** Cada slot de mosaico muestra "PARTE 1, 2, 3, 4" grabado sutilmente.
- **Rarezas Premium:**
    - **Holo:** Marco arcoíris con rotación infinita (`conic-gradient`) y efecto de brillitos (`sparkles`) animados.
    - **Gold:** Acabado Midas integral con pedestal de energía (aura pulsante dorada) en páginas de Honor.

## 🖱️ Experiencia de Usuario
- **Interacción:** Volteo de página habilitado solo mediante clics/drag sobre el área física del libro.
- **Bandeja Inferior:** 
    - Altura fija (210px) con fondo azul noche profundo.
    - Scroll horizontal fluido compatible con rueda de ratón.
    - Visibilidad total de marcos de rareza en figuritas sueltas.
- **Detalle de Colección:** Modal 3D con desenfoque de fondo y descripción histórica completa al hacer clic en figuritas pegadas.

## 🔄 Sistema de Canje (Módulo 6)
- **Valorización por Rareza:**
    - Común: 1 punto.
    - Especial: 2 puntos.
    - Rara: 3 puntos.
    - Holo: 4 puntos.
    - Gold: 5 puntos.
- **Coste de Canje:** 10 puntos por 1 sobre (Opciones de x1, x5 y x10 sobres).
- **Lógica de Descuento:** El sistema prioriza el descuento de figuritas de menor rareza (Comunes -> Especiales -> etc.) para cubrir los puntos necesarios.
- **Interfaz:** Modal dinámico en el Dashboard con cálculo de puntos en tiempo real vía API.
## 🛠️ Pendientes y Bugs Críticos
- **Layout Mobile-First (Álbum):** El libro 3D (`StPageFlip`) no se escala correctamente en pantallas pequeñas, provocando que se corte o no "entre" en el viewport.
- **Visualización de Apertura:** Las figuritas obtenidas en `abrir_sobres.php` no son visibles en ciertos dispositivos (posible problema de desbordamiento o z-index en la vista de resultados).
- **Refactorización de Canje:** Implementado el sistema de probabilidad proporcional (10% por cada sobre) y corrección de reserva de unidad (quantity - 1). Pendiente validar animaciones con múltiples sobres extra.
- **Sistema QR:** Pendiente implementación de validación de `qr_id` y cooldown de 6 horas.

## 💡 Módulo 7: Trivias e Historia (Finalizado)
- **Mecánica:** Sesiones rápidas de 3 preguntas aleatorias.
- **Límite de Tiempo:** 30 segundos por pregunta (con cronómetro visual).
- **Recompensas:** Solo se otorga 1 sobre si se aciertan las 3 preguntas consecutivamente.
- **Restricción:** Cooldown de 6 horas entre intentos (independientemente del resultado) para evitar farmeo excesivo.
- **Interfaz:** Diseño Mobile-First con transiciones fluidas y feedback inmediato.

## 🛡️ Panel de Administración (Finalizado)
- **UI/UX:** Overhaul visual con sistema de "Toasts" personalizados y botones de acción de alta visibilidad (UI consistente con el resto de la app).
- **Configuración de Rarezas:** Interfaz para ajustar probabilidades de drop (Común, Poco Común, Rara, Holo, Gold) en tiempo real con validación de suma 100%.
- **Simulador de Sobres:** Herramienta de auditoría para probar probabilidades sin alterar datos de usuario, con modo ráfaga (x10) y estadísticas de sesión acumuladas.
- **Gestión de Alumnos:** Tabla interactiva con ordenamiento dinámico (clic en cabeceras), barras de progreso visuales y desglose de datos (progreso de pegado, fecha finalización).

## 🎁 Sistema de Códigos Profe (Actualizado)
- **Premio Fijo:** Cada código regala exactamente 1 sobre.
- **Cupos Limitados:** Ahora cada código tiene un límite configurable de alumnos que pueden canjearlo.
- **Expiración:** Validez extendida a 3 días (72 horas) desde la creación.
- **Auditoría:** Panel administrativo muestra el uso de cupos en tiempo real y estado (Activo/Vencido).

