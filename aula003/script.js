const pokemonInput = document.querySelector("#pokemon-input")
const btnBuscar    = document.querySelector("#btn-buscar")
const resultado    = document.querySelector("#resultado")

// ─── TYPE → HSL HUE ─────────────────────────────────────────
const typeHues = {
  fire:260, water:220, grass:120, electric:48, psychic:330,
  ice:185,  dragon:265, dark:25,  fairy:345,  normal:60,
  fighting:5, poison:290, ground:42, rock:45,  bug:80,
  ghost:270,  steel:230, flying:250
}
const typeHuesActual = {
  fire:20, water:215, grass:115, electric:48, psychic:330,
  ice:185, dragon:265, dark:25,  fairy:345,  normal:60,
  fighting:5, poison:290, ground:42, rock:45, bug:80,
  ghost:270, steel:230, flying:250
}

function setTypeTheme(type) {
  const h = typeHuesActual[type] ?? 260
  document.documentElement.style.setProperty('--type-h', h)
}

// ─── PARTICLES ───────────────────────────────────────────────
const canvas = document.getElementById('particles')
const ctx    = canvas.getContext('2d')
let particles = []

function resizeCanvas() {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

function spawnParticle() {
  const h = getComputedStyle(document.documentElement).getPropertyValue('--type-h').trim() || 260
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 10,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(Math.random() * 1.2 + 0.4),
    size: Math.random() * 2.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.2,
    hue: parseInt(h) + (Math.random() * 40 - 20),
    life: 1
  }
}

function tickParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (Math.random() < 0.35) particles.push(spawnParticle())

  particles = particles.filter(p => p.life > 0)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.003
    p.alpha = p.life * 0.6
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`
    ctx.fill()
  }
  requestAnimationFrame(tickParticles)
}
tickParticles()

// ─── HOLO CARD 3D TILT ───────────────────────────────────────
function initHoloCard() {
  const wrap = document.querySelector('.holo-wrap')
  const card = document.querySelector('.holo-card')
  if (!wrap || !card) return

  wrap.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5

    const rotY =  x * 22
    const rotX = -y * 22
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 180

    card.style.transform = `perspective(1200px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.03)`
    card.style.setProperty('--holo-r', `${angle}deg`)
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`)
    card.style.boxShadow = `
      ${x * -20}px ${y * -20}px 60px rgba(0,0,0,0.5),
      0 0 60px var(--type-glow),
      0 0 120px hsla(var(--type-h),80%,60%,0.15)
    `
  })

  wrap.addEventListener('mouseleave', () => {
    card.style.transform = ''
    card.style.boxShadow = ''
    card.style.removeProperty('--mx')
    card.style.removeProperty('--my')
  })
}

// ─── FETCH ───────────────────────────────────────────────────
async function buscarPokemon(pokemon) {
  try {
    resultado.innerHTML = `
      <div class="loading-state">
        <div class="poke-loader"></div>
        <span class="loading-text">carregando...</span>
      </div>`

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase().trim()}/`)
    if (!res.ok) throw new Error('not found')
    mostrarDados(await res.json())

  } catch {
    resultado.innerHTML = `
      <div class="error-state">
        <div style="font-size:52px">💀</div>
        <span class="error-title">Não encontrado</span>
        <span class="error-msg">Nenhum Pokémon com <strong>"${pokemonInput.value}"</strong></span>
      </div>`
  }
}

function mostrarDados(d) {
  const { id, name, height, weight, base_experience, sprites, types, stats } = d
  const img = sprites.other?.['official-artwork']?.front_default || sprites.front_default

  const primaryType = types[0].type.name
  setTypeTheme(primaryType)

  const typeBadges = types
    .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
    .join('')

  const statMeta = {
    hp:              { label:'HP',  cls:'hp'  },
    attack:          { label:'ATK', cls:'atk' },
    defense:         { label:'DEF', cls:'def' },
    'special-attack':{ label:'SpA', cls:'spa' },
    'special-defense':{ label:'SpD', cls:'spd' },
    speed:           { label:'SPE', cls:'spe' },
  }
  const statBars = stats.map(s => {
    const m = statMeta[s.stat.name] ?? { label: s.stat.name, cls:'' }
    const pct = Math.min((s.base_stat / 255) * 100, 100).toFixed(1)
    return `
      <div class="stat-row">
        <span class="sr-label">${m.label}</span>
        <span class="sr-num">${s.base_stat}</span>
        <div class="sr-bar">
          <div class="sr-fill ${m.cls}" style="width:${pct}%"></div>
        </div>
      </div>`
  }).join('')

  resultado.innerHTML = `
    <div class="holo-wrap">
      <div class="holo-card">
        <div class="holo-card-inner">

          <div class="type-banner">
            <div class="type-banner-bg"></div>
            <span class="num-badge">#${String(id).padStart(3,'0')}</span>
            <div class="sprite-ring">
              <img src="${img}" alt="${name}">
            </div>
          </div>

          <div class="card-content">
            <div class="poke-name">${name}</div>
            <div class="types-row">${typeBadges}</div>

            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-label">Altura</span>
                <span class="stat-value">${(height/10).toFixed(1)} m</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Peso</span>
                <span class="stat-value">${(weight/10).toFixed(1)} kg</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Exp. Base</span>
                <span class="stat-value">${base_experience ?? '—'}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Nº Dex</span>
                <span class="stat-value">#${id}</span>
              </div>
            </div>

            <div class="divider"></div>
            <div class="base-stats-title">Base Stats</div>
            ${statBars}
          </div>

          <div class="holo-shine"></div>
          <div class="holo-glare"></div>
        </div>
      </div>
    </div>`

  initHoloCard()
}

// ─── EVENTS ──────────────────────────────────────────────────
function go() {
  if (pokemonInput.value.trim()) buscarPokemon(pokemonInput.value)
}
btnBuscar.addEventListener('click', go)
pokemonInput.addEventListener('keydown', e => { if (e.key === 'Enter') go() })
