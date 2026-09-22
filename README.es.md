# dars-islam

🌐 **Lee esto en:** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

Una plataforma gratuita de pequeños juegos educativos de navegador (Phaser/DOM), enfocada sobre todo en estudios islámicos y árabe, junto con asignaturas escolares generales (matemáticas, lengua, ciencias, etc.), además de cuentas adaptadas a la escuela para alumnos, docentes y padres.

💛 **Apoya este proyecto:** [paypal.me/halgurdh](https://paypal.me/halgurdh) — esta plataforma es gratuita y sin publicidad a propósito; las donaciones ayudan a mantenerlo así.

### ⚠️ Avisos

- **Proyecto construido con IA.** El 100% del código de este repositorio fue escrito con ayuda de IA (Claude Code). No ha sido auditado profesionalmente — puede contener errores, y algunos juegos o funciones podrían no funcionar correctamente. Por favor, informa de cualquier fallo mediante un issue o un pull request.
- **El contenido islámico no ha sido revisado por un erudito.** Los hechos, traducciones y contenido en árabe de los juegos de estudios islámicos se contrastaron con [sunnah.com](https://sunnah.com), [quran.com](https://quran.com) e [islamqa.info](https://islamqa.info) durante el desarrollo, pero **ningún erudito islámico cualificado ha revisado este proyecto**. Verifica de forma independiente cualquier información importante antes de basarte en ella para enseñar, especialmente en el caso de dictámenes religiosos o redacción precisa.
- **No sustituye a una educación real.** Estos juegos son un complemento a la escolarización habitual y a la educación islámica del alumno, no un sustituto — úsalos *además de*, no en lugar de, una enseñanza adecuada en el aula y una docencia cualificada.

---

## Para escuelas, docentes, alumnos y padres

Cualquiera puede jugar a cualquier juego como invitado, sin cuenta — el progreso (XP, niveles, rachas, insignias) se guarda automáticamente en ese dispositivo.

**Alumnos** — para unirte a una clase, pide a tu docente un código de clase, abre **Mi Panel** (enlazado en la cabecera del sitio) y usa el formulario "Unirse a una clase". Esto sincroniza tu progreso con la lista de tu docente y te da un **Código Familiar** (visible en tu panel) para compartir con un padre o madre.

**Docentes** — abre el **Panel del Docente** desde la cabecera del sitio, inicia sesión con tu correo electrónico (se te enviará un enlace mágico de acceso, sin contraseña) y luego crea una escuela y una clase. Comparte el código de la clase con tus alumnos. Desde ahí puedes ver la lista de la clase/tabla de clasificación y asignar juegos específicos a tu clase.

**Padres** — abre el **Panel de Padres** desde la cabecera del sitio, inicia sesión con tu correo electrónico e introduce el Código Familiar que tu hijo/a compartió contigo. Verás su progreso (nivel, rachas, insignias) y podrás establecer un límite diario de tiempo de pantalla y bloquear juegos concretos.

---

## Para desarrolladores (alojamiento propio / ejecutar en tu propio servidor)

**➡️ Consulta [SELF_HOSTING.md](SELF_HOSTING.md) para la guía completa** — configuración de Supabase (el backend de cuentas/progreso/escuelas), Docker, GitHub Pages y despliegues en servidores tradicionales.

Referencia rápida:

```bash
npm install
cp example.env .env.local   # completa VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev                 # desarrollo local (hub wrapper + cada juego)
npm run build                # build de producción → dist/
npm test                     # ejecutar la suite de pruebas
```

`npm run build` reúne el hub wrapper y todos los juegos en `dist/` — una
única carpeta estática, desplegable en cualquier lugar que sirva archivos
estáticos. La app habla directamente con Supabase desde el navegador; no
hay ningún proceso de servidor que ejecutar en producción.

Después de ejecutar las migraciones SQL, también se necesitan dos ajustes del **panel de control** de Supabase (no SQL) para que las cuentas funcionen:
- **Authentication → Providers**: confirma que el correo (enlace mágico) esté habilitado, y activa **Anonymous sign-ins** (necesario para el flujo de unión de alumnos sin correo).
- **Authentication → Emails**: configura un proveedor SMTP real antes de confiar en esto más allá de pruebas — el remitente integrado de Supabase tiene límites de frecuencia estrictos.

**Docker** (la forma más rápida de autoalojarlo — construye el sitio y lo sirve con nginx, no se ejecuta nada más en el contenedor):

```bash
cp example.env .env   # nota: .env, no .env.local — docker compose lee este archivo
# completa VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY en .env
docker compose up --build
# abre http://localhost:8080
```

O sin compose: `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t darsislam-games .` y luego `docker run -p 8080:80 darsislam-games`. Consulta [SELF_HOSTING.md](SELF_HOSTING.md) para más detalles (estos valores quedan integrados en el momento de la compilación, así que cambiarlos implica reconstruir la imagen).

Estructura del repositorio:
- `wrapper/` — el sitio hub público (cuadrícula de juegos, inicio de sesión, paneles)
- `games/<nombre>/` — el código fuente y la configuración de Vite de cada juego
- `shared/` — código compartido por todos los juegos (cliente de Supabase,
  seguimiento de progreso, kits de UI compartidos, i18n)
- `database/supabase/0001_init.sql` — el esquema de Postgres/RLS/RPC que hay
  que ejecutar contra tu proyecto de Supabase
- `scripts/` — herramientas auxiliares de build y despliegue

Las carpetas `api/`/`database/schema.sql` son un backend heredado de
PHP/MySQL, reemplazado por Supabase — se conservan como referencia, pero la
app ya no las utiliza.
