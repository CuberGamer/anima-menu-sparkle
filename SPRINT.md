# Sprint — Ampliación de la instancia jugable

## Objetivo del Sprint
Ampliar la instancia jugable de *Infiltrados* con una mecánica de **sigilo bajo presión**
(sospecha + temporizador + puntaje + condiciones de victoria/derrota + acción "esconderse"),
sin afectar la exploración, los diálogos, las misiones ni el inventario ya existentes.

## Nueva mecánica
- **Sospecha (0–100):** sube al cambiar de escena (+4) y al hablar con el soldado (+18).
- **Temporizador:** 5 minutos (05:00) para completar la infiltración.
- **Puntaje:** +50 por objeto obtenido, +150 por misión completada.
- **Nueva acción:** `ESCONDERSE` baja 25 de sospecha pero cuesta 15 segundos.
- **Victoria:** completar las 3 misiones antes de que se agote el tiempo y sin llegar a 100 de sospecha.
- **Derrota:** sospecha en 100 o tiempo agotado. Ambas muestran pantalla final con puntaje y REINTENTAR.
- **Autoguardado:** el progreso se guarda por partida y se recupera al volver a entrar.

## KPI
| KPI | Meta | Resultado |
| --- | --- | --- |
| Partidas que llegan a un estado final (victoria o derrota) sin errores en consola | 100% | 100% (pruebas manuales y automatizadas en preview) |
| Recuperación del progreso al recargar la página | 100% de las recargas | 100% (cartel "PARTIDA RECUPERADA") |
| Juego sigue operativo con almacenamiento bloqueado o dato corrupto | Sin pantalla en blanco | Cumplido (avisa "SIN GUARDADO" y continúa) |

## Sprint Backlog
1. Modelar el estado de partida y las reglas puras (`src/lib/progress.ts`).
2. Crear capa de almacenamiento tolerante a fallos (`src/lib/storage.ts`).
3. Crear hook de progreso con autoguardado, recuperación y temporizador (`src/hooks/useGameProgress.ts`).
4. Componentes reutilizables de HUD: `StatBar` y `GameOverlay`.
5. Integrar la mecánica en `WorldMap` conservando escenas, diálogos, misiones e inventario.
6. Probar victoria, derrota por tiempo, derrota por sospecha, recarga y storage bloqueado.

## Calidad del software
- **Modularización:** reglas de juego (`progress.ts`), persistencia (`storage.ts`), orquestación (`useGameProgress.ts`) y presentación (`WorldMap`, `StatBar`, `GameOverlay`) están separadas.
- **Reusabilidad:** `StatBar` sirve para cualquier recurso, `GameOverlay` para victoria y derrota, `readJSON/writeJSON` para cualquier clave.
- **Analizabilidad:** funciones puras y cortas con nombres del dominio (`addSuspicion`, `hide`, `changeScene`) y constantes de balance agrupadas arriba.
- **Modificabilidad:** cambiar dificultad es editar constantes (`TOTAL_SECONDS`, `SUSPICION_GUARD`, `POINTS_QUEST`); agregar una regla nueva es una función pura más.
- **Tolerancia a fallos:** todo acceso a `localStorage` va en `try/catch`, `apply()` atrapa excepciones de las reglas y una escena inexistente cae a la escena inicial.
- **Capacidad de recuperación:** los datos corruptos se descartan y se reinicia un progreso válido; el progreso guardado se restaura al volver; `REINTENTAR` limpia y reinicia la partida.
