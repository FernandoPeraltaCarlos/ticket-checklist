(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const a of e)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function i(e){const a={};return e.integrity&&(a.integrity=e.integrity),e.referrerPolicy&&(a.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?a.credentials="include":e.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(e){if(e.ep)return;e.ep=!0;const a=i(e);fetch(e.href,a)}})();let n=[],o=0;const d=4,h=s=>{let t=[],i={get(){return i.lc||i.listen(()=>{})(),i.value},lc:0,listen(r){return i.lc=t.push(r),()=>{for(let a=o+d;a<n.length;)n[a]===r?n.splice(a,d):a+=d;let e=t.indexOf(r);~e&&(t.splice(e,1),--i.lc)}},notify(r,e){let a=!n.length;for(let l of t)n.push(l,i.value,r,e);if(a){for(o=0;o<n.length;o+=d)n[o](n[o+1],n[o+2],n[o+3]);n.length=0}},off(){},set(r){let e=i.value;e!==r&&(i.value=r,i.notify(e))},subscribe(r){let e=i.listen(r);return r(i.value),e},value:s};return i},p="ticket-checklist-v1",f=[{id:"prep",title:"1. Preparacion",description:"Verifica lo esencial antes de iniciar.",items:[{id:"design_link",label:'Validar el "design link" y confirmar que es procesable'},{id:"target_date",label:'Confirmar el "target date" y su vigencia'},{id:"requirements",label:'Revisar requerimientos y trasladarlos a "productivity suite" para clarificar solicitudes'},{id:"attachments",label:"Verificar adjuntos y su completitud"},{id:"docs_question",label:"Se requiere subir documentos?",type:"question"},{id:"pii",label:"Verificar presencia de PII y lineamientos aplicables",dependsOn:{questionId:"docs_question",value:"si"}},{id:"classification",label:"Confirmar clasificacion correspondiente",dependsOn:{questionId:"docs_question",value:"si"}}]},{id:"delivery",title:"2. Entrega",description:"Validaciones finales antes del cierre.",items:[{id:"qa_link",label:"Confirmar inclusion del QA link"},{id:"notes",label:"Verificar que las notas esten incluidas"},{id:"paths",label:"Confirmar que los item paths estan agregados"},{id:"date_time",label:"Verificar que se registro la fecha y hora de identificacion"}]}];function b(){const s=localStorage.getItem(p);if(!s)return{checks:{},docRequirement:null};try{const t=JSON.parse(s);return{checks:t.checks??{},docRequirement:t.docRequirement??null}}catch{return{checks:{},docRequirement:null}}}const c=h(b()),u=document.querySelector("#app");if(!u)throw new Error("#app not found");u.addEventListener("change",s=>{const t=s.target;if(t){if(t.matches("input[type='checkbox'][data-check-id]")){const i=t.dataset.checkId;if(!i)return;const r=c.get();c.set({...r,checks:{...r.checks,[i]:t.checked}})}if(t.matches("input[type='radio'][name='docRequirement']")){const i=t.value==="si"?"si":"no",r=c.get(),e={...r.checks};i==="no"&&(e.pii=!1,e.classification=!1),c.set({...r,docRequirement:i,checks:e})}}});u.addEventListener("click",s=>{const t=s.target;if(!t)return;const i=t.closest("[data-action]");i&&i.dataset.action==="reset"&&(localStorage.removeItem(p),c.set({checks:{},docRequirement:null}))});c.subscribe(s=>{localStorage.setItem(p,JSON.stringify(s)),x(s)});function m(s,t){return s.dependsOn&&s.dependsOn.questionId==="docs_question"?t.docRequirement===s.dependsOn.value:!0}function g(s){const t=f.flatMap(e=>e.items.filter(a=>a.type!=="question"&&m(a,s))),i=t.length,r=t.reduce((e,a)=>e+(s.checks[a.id]?1:0),0);return{total:i,done:r}}function x(s){const{total:t,done:i}=g(s),r=t===0?0:Math.round(i/t*100);u.innerHTML=`
    <main class="min-h-screen bg-[radial-gradient(circle_at_top,_#121521_0%,_#0b0c0f_55%,_#08090b_100%)] px-6 py-10 text-slate-100 md:px-12">
      <div class="mx-auto max-w-4xl">
        <header class="mb-10 flex flex-col gap-6">
          <div class="flex items-start justify-between gap-6">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket Checklist</p>
              <h1 class="mt-3 text-3xl font-semibold text-slate-50 md:text-4xl font-['Space_Grotesk']">
                Control de calidad para tickets
              </h1>
            </div>
            <div class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 md:flex">
              <span class="h-2 w-2 rounded-full bg-[#7ef0c0] shadow-[0_0_12px_rgba(126,240,192,0.6)]"></span>
              Persistente al recargar
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-sm text-slate-400">Progreso global</p>
                <p class="mt-1 text-2xl font-semibold text-slate-100">${i} / ${t} items</p>
              </div>
              <div class="flex w-full flex-col gap-3 md:w-64">
                <div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${r}%"></div>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">${r}% completado</p>
                </div>
                <button
                  type="button"
                  data-action="reset"
                  class="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/40 hover:text-slate-50"
                >
                  Limpiar checklist
                </button>
              </div>
            </div>
          </div>
        </header>

        <section class="grid gap-6">
          ${f.map(e=>{const a=e.items.filter(l=>m(l,s)).map(l=>l.type==="question"?`
                      <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                        <p class="text-sm font-medium text-slate-100">${l.label}</p>
                        <p class="mt-1 text-xs text-slate-400">Selecciona si o no para continuar.</p>
                        <div class="mt-3 flex flex-wrap gap-4 text-sm text-slate-200">
                          <label class="flex items-center gap-2">
                            <input type="radio" name="docRequirement" value="no" ${s.docRequirement==="no"?"checked":""} />
                            <span>No, nada seguimos</span>
                          </label>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="docRequirement" value="si" ${s.docRequirement==="si"?"checked":""} />
                            <span>Si</span>
                          </label>
                        </div>
                      </div>
                    `:`
                    <label class="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/30">
                      <input
                        type="checkbox"
                        data-check-id="${l.id}"
                        class="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
                        ${s.checks[l.id]?"checked":""}
                      />
                      <span class="text-sm text-slate-200 group-hover:text-slate-100">${l.label}</span>
                    </label>
                  `).join("");return`
                <article class="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  <div class="mb-5">
                    <h2 class="text-xl font-semibold text-slate-50 font-['Space_Grotesk']">${e.title}</h2>
                    <p class="mt-1 text-sm text-slate-400">${e.description}</p>
                  </div>
                  <div class="grid gap-3">${a}</div>
                </article>
              `}).join("")}
        </section>
      </div>
    </main>
  `}
