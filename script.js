const state = {
  stops: [
    { id: generateId(), color: '#008080', position: 0 },
    { id: generateId(), color: '#014b4b', position: 100 },
  ],
  direction: 'r',
  type: 'linear',
  flipX: false,
  flipY: false,
}

const els = {
  colorStopsContainer: document.getElementById('color-stops-container'),
  addStopBtn: document.getElementById('add-stop-btn'),
  clearBtn: document.getElementById('clear-btn'),
  dirBtns: document.querySelectorAll('.dir-btn'),
  flipXBtn: document.getElementById('flip-x-btn'),
  flipYBtn: document.getElementById('flip-y-btn'),
  typeLinearBtn: document.getElementById('type-linear-btn'),
  typeRadialBtn: document.getElementById('type-radial-btn'),
  previewArea: document.getElementById('gradient-preview'),
  textPreview: document.getElementById('text-preview-content'),
  previewBadge: document.getElementById('preview-badge-text'),
  codeTwOutput: document.getElementById('code-tw-output'),
  codeTextTwOutput: document.getElementById('code-text-tw-output'),
  codeCssOutput: document.getElementById('code-css-output'),
  arbitraryWarning: document.getElementById('arbitrary-warning'),
  tabBtns: document.querySelectorAll('.win98-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  copyClassBtn: document.getElementById('copy-class-btn'),
  copyCssBtn: document.getElementById('copy-css-btn'),
  copyTwCodeBtn: document.getElementById('copy-tw-code'),
  copyTextTwCodeBtn: document.getElementById('copy-text-tw-code'),
  copyCssCodeBtn: document.getElementById('copy-css-code'),

  gradientBarInteractive: document.getElementById('gradient-bar-interactive'),
  gradientBarMain: document.getElementById('gradient-bar-main'),
  gradientBarTooltips: document.getElementById('gradient-bar-tooltips'),
  gradientBarHandles: document.getElementById('gradient-bar-handles'),
}

const initialState = JSON.parse(JSON.stringify(state))

function resetState() {
  state.stops = JSON.parse(JSON.stringify(initialState.stops))
  state.direction = initialState.direction
  state.type = initialState.type
  state.flipX = initialState.flipX
  state.flipY = initialState.flipY

  els.dirBtns.forEach((b) => {
    b.classList.toggle('active', b.dataset.dir === state.direction)
  })
  els.flipXBtn.classList.toggle('active', state.flipX)
  els.flipYBtn.classList.toggle('active', state.flipY)
  els.typeLinearBtn.classList.toggle('active', state.type === 'linear')
  els.typeRadialBtn.classList.toggle('active', state.type === 'radial')

  renderColorStops()
}

els.clearBtn.addEventListener('click', resetState)

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function renderColorStops() {
  els.colorStopsContainer.innerHTML = ''

  state.stops.sort((a, b) => a.position - b.position)

  state.stops.forEach((stop, index) => {
    const row = document.createElement('div')
    row.className = 'color-stop-row'
    row.innerHTML = `
            <div class="win98-inset" style="display:flex; align-items:center;">
                <input type="color" class="color-picker" value="${stop.color}" data-id="${stop.id}">
            </div>
            <div class="win98-inset">
                <input type="text" class="hex-input" value="${stop.color}" data-id="${stop.id}">
            </div>
            <input type="range" class="pos-slider" min="0" max="100" value="${stop.position}" data-id="${stop.id}">
            <button class="icon-btn remove-btn" data-id="${stop.id}" ${state.stops.length <= 2 ? 'disabled style="opacity:0.3"' : ''}>×</button>
        `
    els.colorStopsContainer.appendChild(row)
  })

  bindStopEvents()
  renderGradientBar()
  updateOutput()
}

function renderGradientBar() {
  const sortedStops = [...state.stops].sort((a, b) => a.position - b.position)
  const stopsStr = sortedStops
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ')
  els.gradientBarMain.style.background = `linear-gradient(to right, ${stopsStr})`

  els.gradientBarTooltips.innerHTML = ''
  state.stops.forEach((stop) => {
    const tooltip = document.createElement('div')
    tooltip.className = 'stop-tooltip'
    tooltip.style.left = `${stop.position}%`
    tooltip.innerHTML = `${stop.color} · ${stop.position}%`
    els.gradientBarTooltips.appendChild(tooltip)
  })

  els.gradientBarHandles.innerHTML = ''
  state.stops.forEach((stop) => {
    const handle = document.createElement('div')
    handle.className = 'stop-handle'
    handle.style.left = `${stop.position}%`
    handle.dataset.id = stop.id
    els.gradientBarHandles.appendChild(handle)
  })
}

function bindStopEvents() {
  const pickers = els.colorStopsContainer.querySelectorAll('.color-picker')
  const hexInputs = els.colorStopsContainer.querySelectorAll('.hex-input')
  const sliders = els.colorStopsContainer.querySelectorAll('.pos-slider')
  const removes = els.colorStopsContainer.querySelectorAll('.remove-btn')

  pickers.forEach((p) =>
    p.addEventListener('input', (e) =>
      updateStopColor(e.target.dataset.id, e.target.value),
    ),
  )
  hexInputs.forEach((h) =>
    h.addEventListener('change', (e) => {
      let val = e.target.value
      if (!val.startsWith('#')) val = '#' + val
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        updateStopColor(e.target.dataset.id, val)
      } else {
        e.target.value = state.stops.find(
          (s) => s.id === e.target.dataset.id,
        ).color
      }
    }),
  )
  sliders.forEach((s) =>
    s.addEventListener('input', (e) =>
      updateStopPosition(e.target.dataset.id, parseInt(e.target.value)),
    ),
  )

  removes.forEach((btn) =>
    btn.addEventListener('click', (e) => removeStop(e.target.dataset.id)),
  )
}

function updateStopColor(id, color) {
  const stop = state.stops.find((s) => s.id === id)
  if (stop) {
    stop.color = color
    renderGradientBar()
    updateOutput()

    const hexInput = document.querySelector(`.hex-input[data-id="${id}"]`)
    if (hexInput && document.activeElement !== hexInput) hexInput.value = color
    const picker = document.querySelector(`.color-picker[data-id="${id}"]`)
    if (picker && document.activeElement !== picker) picker.value = color
  }
}

function updateStopPosition(id, pos) {
  const stop = state.stops.find((s) => s.id === id)
  if (stop) {
    stop.position = Math.max(0, Math.min(100, pos))
    renderGradientBar()
    updateOutput()

    const slider = document.querySelector(`.pos-slider[data-id="${id}"]`)
    if (slider) slider.value = stop.position
  }
}

els.colorStopsContainer.addEventListener('change', (e) => {
  if (e.target.classList.contains('pos-slider')) {
    renderColorStops()
  }
})

function addStop(pos = null, color = null) {
  let newPos
  if (pos !== null) {
    newPos = pos
  } else {
    const sorted = [...state.stops].sort((a, b) => a.position - b.position)
    let maxGap = 0
    let gapMid = 50
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position
      if (gap > maxGap) {
        maxGap = gap
        gapMid = Math.round((sorted[i].position + sorted[i + 1].position) / 2)
      }
    }
    newPos = gapMid
  }

  const newColor = color !== null ? color : '#888888'
  state.stops.push({ id: generateId(), color: newColor, position: newPos })
  renderColorStops()
}

function removeStop(id) {
  if (state.stops.length <= 2) return
  state.stops = state.stops.filter((s) => s.id !== id)
  renderColorStops()
}

let draggingStopId = null

els.gradientBarInteractive.addEventListener('mousedown', (e) => {
  const handle = e.target.closest('.stop-handle')
  if (handle) {
    draggingStopId = handle.dataset.id
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  } else {
    const rect = els.gradientBarInteractive.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const percent = Math.round((offsetX / rect.width) * 100)

    addStop(percent)
  }
})

function handleMouseMove(e) {
  if (!draggingStopId) return
  const rect = els.gradientBarInteractive.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  let percent = Math.round((offsetX / rect.width) * 100)
  percent = Math.max(0, Math.min(100, percent))
  updateStopPosition(draggingStopId, percent)
}

function handleMouseUp() {
  draggingStopId = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  renderColorStops()
}

els.addStopBtn.addEventListener('click', () => addStop())

els.dirBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    els.dirBtns.forEach((b) => b.classList.remove('active'))
    e.target.classList.add('active')
    state.direction = e.target.dataset.dir
    updateOutput()
  })
})

els.flipXBtn.addEventListener('click', () => {
  state.flipX = !state.flipX
  els.flipXBtn.classList.toggle('active', state.flipX)
  updateOutput()
})

els.flipYBtn.addEventListener('click', () => {
  state.flipY = !state.flipY
  els.flipYBtn.classList.toggle('active', state.flipY)
  updateOutput()
})

els.typeLinearBtn.addEventListener('click', () => {
  state.type = 'linear'
  els.typeLinearBtn.classList.add('active')
  els.typeRadialBtn.classList.remove('active')
  updateOutput()
})

els.typeRadialBtn.addEventListener('click', () => {
  state.type = 'radial'
  els.typeRadialBtn.classList.add('active')
  els.typeLinearBtn.classList.remove('active')
  updateOutput()
})

els.tabBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    els.tabBtns.forEach((b) => b.classList.remove('active'))
    els.tabPanes.forEach((p) => p.classList.remove('active'))
    e.target.classList.add('active')
    document.getElementById(e.target.dataset.target).classList.add('active')
  })
})

function getEffectiveDirection() {
  let dir = state.direction
  if (state.flipX) {
    dir = dir.replace('r', 'X').replace('l', 'r').replace('X', 'l')
  }
  if (state.flipY) {
    dir = dir.replace('t', 'Y').replace('b', 't').replace('Y', 'b')
  }
  return dir
}

const linearCssMap = {
  t: 'to top',
  tr: 'to top right',
  r: 'to right',
  br: 'to bottom right',
  b: 'to bottom',
  bl: 'to bottom left',
  l: 'to left',
  tl: 'to top left',
  c: 'to right',
}

const radialCssMap = {
  t: 'at top',
  tr: 'at top right',
  r: 'at right',
  br: 'at bottom right',
  b: 'at bottom',
  bl: 'at bottom left',
  l: 'at left',
  tl: 'at top left',
  c: 'at center',
}

const linearTwMap = {
  t: 'bg-gradient-to-t',
  tr: 'bg-gradient-to-tr',
  r: 'bg-gradient-to-r',
  br: 'bg-gradient-to-br',
  b: 'bg-gradient-to-b',
  bl: 'bg-gradient-to-bl',
  l: 'bg-gradient-to-l',
  tl: 'bg-gradient-to-tl',
  c: 'bg-gradient-to-r',
}

function generateCss() {
  const dir = getEffectiveDirection()
  const sortedStops = [...state.stops].sort((a, b) => a.position - b.position)
  const stopsStr = sortedStops
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ')

  if (state.type === 'linear') {
    return `background: linear-gradient(${linearCssMap[dir]}, ${stopsStr});`
  } else {
    return `background: radial-gradient(circle ${radialCssMap[dir]}, ${stopsStr});`
  }
}

function generateTailwind() {
  const dir = getEffectiveDirection()
  const sortedStops = [...state.stops].sort((a, b) => a.position - b.position)
  const count = sortedStops.length

  if (state.type === 'linear' && count <= 3) {
    let twClass = `${linearTwMap[dir]} `
    if (count === 2) {
      twClass += `from-[${sortedStops[0].color}] to-[${sortedStops[1].color}]`
    } else if (count === 3) {
      twClass += `from-[${sortedStops[0].color}] via-[${sortedStops[1].color}] to-[${sortedStops[2].color}]`
    }
    return twClass
  } else {
    const stopsStr = sortedStops
      .map((s) => `${s.color}_${s.position}%`)
      .join(',_')
    if (state.type === 'linear') {
      const cssDirStr = linearCssMap[dir].replace(/ /g, '_')
      return `bg-[linear-gradient(${cssDirStr},_${stopsStr})]`
    } else {
      const cssDirStr = radialCssMap[dir].replace(/ /g, '_')
      return `bg-[radial-gradient(circle_${cssDirStr},_${stopsStr})]`
    }
  }
}

function updateOutput() {
  const css = generateCss()
  const tw = generateTailwind()
  const textTw = `${tw} bg-clip-text text-transparent`
  const gradientValue = css.replace('background: ', '').replace(';', '')

  els.previewArea.style.background = gradientValue

  els.textPreview.style.backgroundImage = gradientValue
  els.textPreview.style.webkitBackgroundClip = 'text'
  els.textPreview.style.backgroundClip = 'text'
  els.textPreview.style.color = 'transparent'

  els.previewBadge.textContent =
    tw.length > 40 ? tw.substring(0, 40) + '...' : tw

  els.codeCssOutput.textContent = css
  els.codeTwOutput.textContent = tw
  els.codeTextTwOutput.textContent = textTw

  if (state.stops.length > 3 || state.type === 'radial') {
    els.arbitraryWarning.classList.remove('hidden')
  } else {
    els.arbitraryWarning.classList.add('hidden')
  }
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent
    btn.textContent = 'Copied!'
    setTimeout(() => {
      btn.textContent = originalText
    }, 1500)
  })
}

els.copyClassBtn.addEventListener('click', (e) =>
  copyText(generateTailwind(), e.target),
)
els.copyCssBtn.addEventListener('click', (e) =>
  copyText(generateCss(), e.target),
)
els.copyTwCodeBtn.addEventListener('click', (e) =>
  copyText(generateTailwind(), e.target),
)
els.copyTextTwCodeBtn.addEventListener('click', (e) =>
  copyText(`${generateTailwind()} bg-clip-text text-transparent`, e.target),
)
els.copyCssCodeBtn.addEventListener('click', (e) =>
  copyText(generateCss(), e.target),
)

renderColorStops()
