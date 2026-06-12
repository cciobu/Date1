(() => {
  const steps = Array.from(document.querySelectorAll('.step'))
  const goToStep = (n) => {
    steps.forEach(s => s.classList.remove('active'))
    const el = document.querySelector(`[data-step="${n}"]`)
    if(el) el.classList.add('active')
  }

  // Landing
  const yesBtn = document.getElementById('yesBtn')
  const noBtn = document.getElementById('noBtn')
  yesBtn.addEventListener('click', ()=> goToStep(2))

  // Make NO button run away
  function moveNoButtonRandomly() {
    const padding = 12
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const btn = noBtn
    // size of button
    const rect = btn.getBoundingClientRect()
    const maxX = Math.max(0, vw - rect.width - padding)
    const maxY = Math.max(0, vh - rect.height - padding)
    const left = Math.floor(Math.random() * maxX)
    const top = Math.floor(Math.random() * maxY)
    btn.style.position = 'fixed'
    btn.style.left = left + 'px'
    btn.style.top = top + 'px'
    // small rotation for playful feel
    btn.style.transform = `translateZ(0) rotate(${(Math.random()-0.5)*12}deg)`
  }

  // Move on mouseenter or touchstart
  noBtn.addEventListener('mouseenter', moveNoButtonRandomly)
  noBtn.addEventListener('mousemove', moveNoButtonRandomly)
  noBtn.addEventListener('click', (e)=>{ e.preventDefault(); moveNoButtonRandomly() })
  noBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); moveNoButtonRandomly() }, {passive:false})

  // Step 2: date + time
  const dateInput = document.getElementById('dateInput')
  const timeInput = document.getElementById('timeInput')
  const dateContinue = document.getElementById('dateContinue')
  function checkDateTime() {
    if (dateInput.value && timeInput.value) { dateContinue.disabled = false; dateContinue.classList.remove('disabled') }
    else { dateContinue.disabled = true; dateContinue.classList.add('disabled') }
  }
  dateInput.addEventListener('input', checkDateTime)
  timeInput.addEventListener('input', checkDateTime)
  dateContinue.addEventListener('click', ()=> goToStep(3))

  // Step 3: activity
  const activityOptions = document.getElementById('activityOptions')
  const activityContinue = document.getElementById('activityContinue')
  let selectedActivity = null
  activityOptions.addEventListener('click', (e)=>{
    const btn = e.target.closest('.option')
    if(!btn) return
    Array.from(activityOptions.children).forEach(b=>b.classList.remove('selected'))
    btn.classList.add('selected')
    selectedActivity = btn.textContent.trim()
    activityContinue.disabled = false; activityContinue.classList.remove('disabled')
  })
  activityContinue.addEventListener('click', ()=> goToStep(4))

  // Step 4: place
  const placeOptions = document.getElementById('placeOptions')
  const finalizeBtn = document.getElementById('finalizeBtn')
  let selectedPlace = null
  placeOptions.addEventListener('click', (e)=>{
    const btn = e.target.closest('.option')
    if(!btn) return
    Array.from(placeOptions.children).forEach(b=>b.classList.remove('selected'))
    btn.classList.add('selected')
    selectedPlace = btn.textContent.trim()
    finalizeBtn.disabled = false; finalizeBtn.classList.remove('disabled')
  })

  // Finalize -> summary + auto-send
  const summaryEl = document.getElementById('summary')
  const sendBtn = document.getElementById('sendBtn')

  function gatherDetails(){
    return {
      date: dateInput.value || null,
      time: (timeInput && timeInput.value) ? timeInput.value : null,
      activity: selectedActivity || null,
      place: selectedPlace || null
    }
  }

  function renderSummary(details){
    summaryEl.innerHTML = `
      <strong>Data:</strong> ${details.date || '—'} ${details.time ? 'ora ' + details.time : ''}<br>
      <strong>Activitate:</strong> ${details.activity || '—'}<br>
      <strong>Loc:</strong> ${details.place || '—'}
    `
  }

  const getApiUrl = () => {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000/send-sms'
    // production: assume hosting rewrites (Firebase Hosting, Vercel rewrite, etc.)
    return '/send-sms'
  }

  async function sendSms(details){
    try{
      const res = await fetch(getApiUrl(), {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({details})
      })
      if(!res.ok){
        let errText = `HTTP ${res.status}`
        try{ const j = await res.json(); if(j && j.error) errText = j.error }catch(e){}
        throw new Error(errText)
      }
      const json = await res.json().catch(()=>({ok:true}))
      if(json && json.ok){
        sendBtn.textContent = 'Notificare trimisă ✅'
        sendBtn.disabled = true
      }
    }catch(err){
      console.error(err)
      sendBtn.textContent = 'Eroare trimitere'
    }
  }

  finalizeBtn.addEventListener('click', ()=>{
    const details = gatherDetails()
    renderSummary(details)
    goToStep(5)
    // auto-send after finalizare
    sendSms(details)
  })

  sendBtn.addEventListener('click', ()=>{
    const details = gatherDetails()
    sendSms(details)
  })

  // Basic keyboard accessibility: if user focuses NO and presses Enter, move it
  noBtn.addEventListener('focus', moveNoButtonRandomly)

  // reset position when resizing
  window.addEventListener('resize', ()=>{ noBtn.style.position='relative'; noBtn.style.left=''; noBtn.style.top=''; noBtn.style.transform=''; })

})();
