<script>
  import { api } from './lib/api.js';
  import { resources, roleAccess } from './lib/resources.js';

  const accounts = [
    { username: 'admin', password: '1234', role: 'Administrador', name: 'Administrador' },
    { username: 'conductor', password: '2026**', role: 'Conductor', name: 'Conductor' },
    { username: 'acudiente', password: '2026**', role: 'Acudiente', name: 'Acudiente' },
    { username: 'estudiante', password: '2026**', role: 'Estudiante', name: 'Estudiante' }
  ];
  let session, username = '', password = '', loginError = '', active = 'inicio';
  let records = [], loading = false, error = '', notice = '', showForm = false, form = {}, editingId;
  $: config = resources[active];
  $: allowed = session ? roleAccess[session.role] : [];
  $: columns = config?.fields.slice(0, 4) ?? [];
  $: isAdmin = session?.role === 'Administrador';
  $: canCreate = isAdmin || (session?.role === 'Conductor' && active === 'registros-abordaje');
  const display = value => value === true ? 'Sí' : value === false ? 'No' : value ?? '—';

  function login() {
    session = accounts.find(a => a.username === username.trim().toLowerCase() && a.password === password);
    loginError = session ? '' : 'Usuario o contraseña incorrectos.';
    if (session) { active = 'inicio'; password = ''; }
  }
  function logout() { session = undefined; active = 'inicio'; records = []; showForm = false; }
  async function load(resource = active) {
    if (!resources[resource] || !allowed.includes(resource)) return;
    loading = true; error = '';
    try { records = await api.list(resource); } catch (e) { records = []; error = e.message; } finally { loading = false; }
  }
  function select(resource) { active = resource; records = []; notice = ''; error = ''; showForm = false; load(); }
  function openForm(record) { editingId = record?.id; form = Object.fromEntries(config.fields.map(([key]) => [key, record?.[key] ?? ''])); showForm = true; }
  function normalize() { const data = { ...form }; for (const [key,, type] of config.fields) { if (data[key] === '') delete data[key]; else if (type === 'number') data[key] = Number(data[key]); else if (key === 'activo') data[key] = data[key] === 'true'; } return data; }
  async function save() { try { editingId ? await api.update(active, editingId, normalize()) : await api.create(active, normalize()); showForm = false; notice = 'Registro guardado correctamente.'; load(); } catch (e) { error = e.message; } }
  async function remove(id) { if (!confirm('¿Eliminar este registro?')) return; try { await api.remove(active, id); notice = 'Registro eliminado.'; load(); } catch (e) { error = e.message; } }
</script>

{#if !session}
  <main class="login-page"><section class="login-brand"><span class="brand-mark">R</span><p class="eyebrow">RUTAESCOLAR</p><h1>La operación escolar, en movimiento.</h1><p>Un acceso pensado para cada persona que hace posible el recorrido.</p><div class="login-decoration">⌁</div></section><section class="login-card"><p class="eyebrow">BIENVENIDO</p><h2>Inicia sesión</h2><p class="muted">Usa las credenciales asignadas a tu perfil.</p><form on:submit|preventDefault={login}><label>Usuario<input bind:value={username} autocomplete="username" required /></label><label>Contraseña<input bind:value={password} type="password" autocomplete="current-password" required /></label>{#if loginError}<p class="error">{loginError}</p>{/if}<button class="primary wide">Ingresar</button></form><p class="demo-note">Demo: admin / 1234</p></section></main>
{:else}
  <div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">R</span><div><strong>RutaEscolar</strong><small>{session.role}</small></div></div><nav><button class:active={active === 'inicio'} on:click={() => active = 'inicio'}><span>⌂</span> Inicio</button><p>{isAdmin ? 'ADMINISTRACIÓN' : 'MI TRANSPORTE'}</p>{#each allowed as key}<button class:active={active === key} on:click={() => select(key)}><span>{resources[key].icon}</span> {resources[key].label}</button>{/each}</nav><div class="sidebar-footer"><span class="avatar">{session.name.slice(0, 2)}</span><div><strong>{session.name}</strong><small>{session.role}</small></div></div></aside><main><header><div><p class="eyebrow">{session.role.toUpperCase()}</p><h1>{active === 'inicio' ? `Hola, ${session.name}` : config.label}</h1></div><button class="sign-out" on:click={logout}>Cerrar sesión</button></header>
  {#if active === 'inicio'}<section class="welcome"><div><span class="pill">{session.role.toUpperCase()}</span><h2>Tu transporte, organizado.</h2><p>Consulta y gestiona la información de tus rutas escolares.</p><button class="primary" on:click={() => select(allowed[0])}>Continuar →</button></div><div class="bus">🚌</div></section><section class="role-guidance"><h2>Accesos disponibles</h2><div class="access-chips">{#each allowed as key}<button on:click={() => select(key)}>{resources[key].icon} {resources[key].label}</button>{/each}</div></section>
  {:else}<section class="content-header"><p>{records.length} registros</p>{#if canCreate}<button class="primary" on:click={() => openForm()}>＋ Añadir</button>{/if}</section>{#if notice}<div class="notice">✓ {notice}</div>{/if}{#if error}<div class="error">{error}</div>{/if}<section class="panel"><div class="panel-top"><strong>{config.label}</strong><button class="refresh" on:click={() => load()}>↻ Actualizar</button></div>{#if loading}<div class="empty">Cargando…</div>{:else if !records.length}<div class="empty"><strong>No hay registros disponibles</strong></div>{:else}<div class="table-wrap"><table><thead><tr><th>ID</th>{#each columns as [, label]}<th>{label}</th>{/each}{#if isAdmin}<th>Acciones</th>{/if}</tr></thead><tbody>{#each records as record}<tr><td>#{record.id}</td>{#each columns as [key]}<td>{display(record[key])}</td>{/each}{#if isAdmin}<td><button class="edit" on:click={() => openForm(record)}>Editar</button><button class="delete" on:click={() => remove(record.id)}>Eliminar</button></td>{/if}</tr>{/each}</tbody></table></div>{/if}</section>{/if}
  </main>{#if showForm}<button class="backdrop" type="button" aria-label="Cerrar formulario" on:click={() => showForm = false}></button><div class="modal" role="dialog" aria-modal="true"><div class="modal-title"><h2>{editingId ? 'Editar' : 'Añadir'} {config.label}</h2><button class="close" on:click={() => showForm = false}>×</button></div><form on:submit|preventDefault={save}>{#each config.fields as [key, label, type, required, options]}<label>{label}{#if required}<b>*</b>{/if}{#if type === 'select'}<select bind:value={form[key]} required={required}><option value="">Selecciona una opción</option>{#each options as option}<option value={option}>{option}</option>{/each}</select>{:else}<input bind:value={form[key]} type={type} required={required} />{/if}</label>{/each}<div class="form-actions"><button type="button" class="secondary" on:click={() => showForm = false}>Cancelar</button><button class="primary">Guardar</button></div></form></div>{/if}</div>
{/if}
