(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&t(l)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();let c=[],b=0;const k=4,E=s=>{let e=[],a={get(){return a.lc||a.listen(()=>{})(),a.value},lc:0,listen(t){return a.lc=e.push(t),()=>{for(let n=b+k;n<c.length;)c[n]===t?c.splice(n,k):n+=k;let i=e.indexOf(t);~i&&(e.splice(i,1),--a.lc)}},notify(t,i){let n=!c.length;for(let l of e)c.push(l,a.value,t,i);if(n){for(b=0;b<c.length;b+=k)c[b](c[b+1],c[b+2],c[b+3]);c.length=0}},off(){},set(t){let i=a.value;i!==t&&(a.value=t,a.notify(i))},subscribe(t){let i=a.listen(t);return t(a.value),i},value:s};return a},_="ticket-checklist-v1",w=[""],v={description:"",itemPath:"",comment:""},L=[{id:"prep",title:"1. Preparacion",description:"Verifica lo esencial antes de iniciar.",items:[{id:"classification_correct",label:"La clasificacion es correcta?"},{id:"assets_included",label:"Estan incluidos los assets?"},{id:"queue_correct",label:"El queue es correcto?"},{id:"design_link",label:'Validar el "design link" y confirmar que es procesable'},{id:"target_date",label:'Confirmar el "target date" y su vigencia'},{id:"requirements",label:'Revisar requerimientos y trasladarlos a "productivity suite" para clarificar solicitudes'},{id:"attachments",label:"Verificar adjuntos y su completitud"},{id:"docs_question",label:"Se requiere subir documentos?",type:"question"},{id:"pii",label:"Verificar presencia de PII y lineamientos aplicables",dependsOn:{questionId:"docs_question",value:"si"}},{id:"classification",label:"Confirmar clasificacion correspondiente",dependsOn:{questionId:"docs_question",value:"si"}}]},{id:"tasks",title:"2. Tareas",description:"Registra cada tarea y su contexto.",items:[]},{id:"delivery",title:"3. Entrega",description:"Validaciones finales antes del cierre.",items:[{id:"qa_link",label:"Confirmar inclusion del QA link"},{id:"notes",label:"Verificar que las notas esten incluidas"},{id:"paths",label:"Confirmar que los item paths estan agregados"},{id:"date_time",label:"Verificar que se registro la fecha y hora de identificacion"}]}];function I(){const s=localStorage.getItem(_);if(!s)return{checks:{},docRequirement:null,confirmReset:!1,env:"p01",designLinks:w,tasks:[{...v}]};try{const e=JSON.parse(s),a=Array.isArray(e.designLinks)&&e.designLinks.length>0?e.designLinks:e.designLink?[e.designLink]:w,t=e.task?[e.task]:[],i=Array.isArray(e.tasks)?e.tasks:t,n=i.length>0?i.map(l=>({description:(l==null?void 0:l.description)??"",itemPath:(l==null?void 0:l.itemPath)??"",comment:(l==null?void 0:l.comment)??""})):[{...v}];return{checks:e.checks??{},docRequirement:e.docRequirement??null,confirmReset:!1,env:e.env??"p01",designLinks:a,tasks:n}}catch{return{checks:{},docRequirement:null,confirmReset:!1,env:"p01",designLinks:w,tasks:[{...v}]}}}const o=E(I()),g=document.querySelector("#app");if(!g)throw new Error("#app not found");const S=document.body,$=()=>{S.dataset.atTop=window.scrollY<=8?"true":"false"};window.addEventListener("scroll",$,{passive:!0});window.addEventListener("resize",$);$();g.addEventListener("change",s=>{const e=s.target;if(e){if(e.matches("input[type='checkbox'][data-check-id]")){const a=e.dataset.checkId;if(!a)return;const t=o.get();o.set({...t,checks:{...t.checks,[a]:e.checked}})}if(e.matches("input[type='radio'][name='docRequirement']")){const a=e.value==="si"?"si":"no",t=o.get(),i={...t.checks};a==="no"&&(i.pii=!1,i.classification=!1),o.set({...t,docRequirement:a,checks:i})}}});g.addEventListener("input",s=>{const e=s.target;if(e){if(e.matches("input[type='url'][data-field='designLink']")){const a=Number(e.dataset.index??"0"),t=o.get(),i=[...t.designLinks];i[a]=e.value,o.set({...t,designLinks:i})}if(e.matches("select[data-field='env']")){const a=e.value,t=o.get();o.set({...t,env:a})}if(e.matches("input[data-task-field], textarea[data-task-field]")){const a=e.dataset.taskField,t=Number(e.dataset.taskIndex??"-1");if(!a||Number.isNaN(t))return;const i=o.get();if(!i.tasks[t])return;const n=[...i.tasks];n[t]={...n[t],[a]:e.value},o.set({...i,tasks:n})}}});g.addEventListener("click",s=>{const e=s.target;if(!e)return;const a=e.closest("[data-action]");if(a){if(a.dataset.action==="reset"){const t=o.get();o.set({...t,confirmReset:!0})}if(a.dataset.action==="reset-confirm"&&(localStorage.removeItem(_),o.set({checks:{},docRequirement:null,confirmReset:!1,env:"p01",designLinks:w,tasks:[{...v}]})),a.dataset.action==="reset-cancel"){const t=o.get();o.set({...t,confirmReset:!1})}if(a.dataset.action==="add-design-link"){const t=o.get();o.set({...t,designLinks:[...t.designLinks,""]})}if(a.dataset.action==="add-task"){const t=o.get();o.set({...t,tasks:[...t.tasks,{...v}]})}if(a.dataset.action==="delete-task"){const t=Number(a.dataset.taskIndex??"-1");if(Number.isNaN(t))return;const i=o.get(),n=i.tasks.filter((l,x)=>x!==t);o.set({...i,tasks:n})}}});o.subscribe(s=>{localStorage.setItem(_,JSON.stringify(s)),j(s)});function q(s,e){return s.dependsOn&&s.dependsOn.questionId==="docs_question"?e.docRequirement===s.dependsOn.value:!0}function P(s){return{total:3,done:(s.description.trim()?1:0)+(s.itemPath.trim()?1:0)+(s.comment.trim()?1:0)}}function T(s){return s.description.trim().length>0&&s.itemPath.trim().length>0}function O(s){const e=L.flatMap(u=>u.items.filter(r=>r.type!=="question"&&q(r,s))),a=e.length,t=e.reduce((u,r)=>u+(s.checks[r.id]?1:0),0),i=s.tasks.length,n=s.tasks.reduce((u,r)=>u+(T(r)?1:0),0),l=a+i,x=t+n;return{total:l,done:x}}function h(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function N(s,e){if(!s.trim())return{output:"",status:""};const a=s.startsWith("http://")||s.startsWith("https://")?s:`https://${s}`;let t;try{t=new URL(a)}catch{return{output:"",status:"URL invalida"}}const n={"www.business.hsbc.uk":{country:"uk"},"www.business.hsbc.fr":{country:"fr"},"www.europe.business.hsbc.com":{countryInPath:!0}}[t.hostname];if(!n)return{output:"",status:"Dominio no reconocido"};const l=t.pathname.split("/").filter(Boolean),x=n.countryInPath?l[0]:n.country??"",u=n.countryInPath?l[1]??"":l[0]??"",r=n.countryInPath?l.slice(2).join("/"):l.slice(1).join("/");if(!x)return{output:"",status:"Pais no encontrado en la URL"};if(!u)return{output:"",status:"Idioma no encontrado en la URL"};const p=`https://link.${x}.dev.${e}.hsbc/${u}`,d=r?`/${r}`:"";return{output:`${p}${d}${t.search}${t.hash}`,status:`Listo | entorno ${e}`}}function j(s){if(!g)return;const{total:e,done:a}=O(s),t=e===0?0:Math.round(a/e*100),i=Math.max(e-a,0),n=s.designLinks.map(r=>N(r,s.env)),l=n.find((r,p)=>{var d;return((d=s.designLinks[p])==null?void 0:d.trim())&&r.status!==`Listo | entorno ${s.env}`}),x=s.designLinks.some(r=>r.trim().length>0),u=l?l.status:x?`Listo | entorno ${s.env}`:"Ingresa un link para generar la version de desarrollo.";g.innerHTML=`
    <main class="min-h-screen bg-[radial-gradient(circle_at_top,_#121521_0%,_#0b0c0f_55%,_#08090b_100%)] px-6 py-10 pb-28 text-slate-100 md:px-12">
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
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ef0c0]/60"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-[#7ef0c0] shadow-[0_0_12px_rgba(126,240,192,0.6)]"></span>
              </span>
              Persistente al recargar
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-sm text-slate-400">Progreso global</p>
                <p class="mt-1 text-2xl font-semibold text-slate-100">${a} / ${e} items</p>
              </div>
              <div class="flex w-full flex-col gap-3 md:w-64">
                <div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${t}%"></div>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">${t}% completado</p>
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
          <div class="rounded-2xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm text-slate-400">Conversion de links</p>
                  <p class="mt-1 text-lg font-semibold text-slate-100">
                    Live a desarrollo
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <label class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Entorno</span>
                    <select
                      data-field="env"
                      class="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200"
                    >
                      ${["p01","p02","bwe","gwe"].map(r=>`<option value="${r}" ${s.env===r?"selected":""}>${r}</option>`).join("")}
                    </select>
                  </label>
                  <button
                    type="button"
                    data-action="add-design-link"
                    class="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/40 hover:text-slate-50"
                  >
                    Agregar link
                  </button>
                </div>
              </div>
              <div class="grid gap-5">
                ${s.designLinks.map((r,p)=>{const d=n[p];return`
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="grid gap-2 text-sm text-slate-300">
                        <span class="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Link live ${p+1}
                        </span>
                        <input
                          type="url"
                          data-field="designLink"
                          data-index="${p}"
                          placeholder="https://www.business.hsbc.uk/en-gb/..."
                          value="${h(r)}"
                          class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                        />
                      </label>
                      <label class="grid gap-2 text-sm text-slate-300">
                        <span class="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Link dev generado
                        </span>
                        <input
                          type="text"
                          readonly
                          value="${h(d.output)}"
                          class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none"
                        />
                      </label>
                    </div>
                  `}).join("")}
              </div>
              <p class="text-xs text-slate-500">
                ${u}
              </p>
            </div>
          </div>
        </header>

        <section class="grid gap-6">
          ${L.map(r=>{if(r.id==="tasks")return`
                  <article class="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 class="text-xl font-semibold text-slate-50 font-['Space_Grotesk']">${r.title}</h2>
                        <p class="mt-1 text-sm text-slate-400">${r.description}</p>
                      </div>
                      <button
                        type="button"
                        data-action="add-task"
                        class="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/40 hover:text-slate-50"
                      >
                        Agregar tarea
                      </button>
                    </div>
                    <div class="grid gap-4">
                      ${s.tasks.map((d,f)=>{const m=P(d),y=Math.round(m.done/m.total*100);return`
                            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                              <div class="mb-3 flex items-center justify-between gap-3">
                                <p class="text-sm font-medium text-slate-100">Tarea ${f+1}</p>
                                <button
                                  type="button"
                                  data-action="delete-task"
                                  data-task-index="${f}"
                                  class="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-rose-300/40 hover:text-rose-200"
                                >
                                  Eliminar
                                </button>
                              </div>
                              <div class="mb-4">
                                <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                  <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${y}%"></div>
                                </div>
                                <p class="mt-1 text-xs text-slate-400">${m.done} / ${m.total} campos completados</p>
                              </div>
                              <div class="grid gap-3">
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs uppercase tracking-[0.2em] text-slate-500">Descripcion *</span>
                                  <input
                                    type="text"
                                    data-task-field="description"
                                    data-task-index="${f}"
                                    placeholder="Describe la tarea..."
                                    value="${h(d.description)}"
                                    class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  />
                                </label>
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs uppercase tracking-[0.2em] text-slate-500">Agregar item path *</span>
                                  <input
                                    type="text"
                                    data-task-field="itemPath"
                                    data-task-index="${f}"
                                    placeholder="Ej: /home/dashboard/settings"
                                    value="${h(d.itemPath)}"
                                    class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  />
                                </label>
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs uppercase tracking-[0.2em] text-slate-500">Si existe error u observacion, agrega comentario</span>
                                  <textarea
                                    data-task-field="comment"
                                    data-task-index="${f}"
                                    placeholder="Comentario opcional"
                                    rows="3"
                                    class="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  >${h(d.comment)}</textarea>
                                </label>
                              </div>
                            </div>
                          `}).join("")}
                    </div>
                  </article>
                `;const p=r.items.map(d=>{if(d.type==="question")return`
                      <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                        <p class="text-sm font-medium text-slate-100">${d.label}</p>
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
                    `;const f=!!s.checks[d.id],m=!d.dependsOn||q(d,s),y=d.dependsOn?`<div class="reveal" data-visible="${m}">`:"",R=d.dependsOn?"</div>":"";return`
                    ${y}
                    <label class="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/30">
                      <input
                        type="checkbox"
                        data-check-id="${d.id}"
                        class="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
                        ${f?"checked":""}
                      />
                      <span class="text-sm text-slate-200 group-hover:text-slate-100 ${f?"task-checked":""}">${d.label}</span>
                    </label>
                    ${R}
                  `}).join("");return`
                <article class="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  <div class="mb-5">
                    <h2 class="text-xl font-semibold text-slate-50 font-['Space_Grotesk']">${r.title}</h2>
                    <p class="mt-1 text-sm text-slate-400">${r.description}</p>
                  </div>
                  <div class="grid gap-3">${p}</div>
                </article>
              `}).join("")}
        </section>
      </div>
      <div class="footer-bar sticky bottom-4 mt-10">
        <div class="mx-auto max-w-4xl rounded-full border border-white/10 bg-black/50 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur">
          <div class="flex flex-wrap items-center gap-4">
            <div class="min-w-[180px] flex-1">
              <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${t}%"></div>
              </div>
              <p class="mt-2 text-xs text-slate-400">${i} pendientes</p>
            </div>
            <div class="text-sm font-semibold text-slate-100">
              ${a} / ${e}
            </div>
          </div>
        </div>
      </div>
    </main>
    ${s.confirmReset?`
    <div class="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-md rounded-2xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.96),_rgba(11,12,15,0.96))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Confirmacion</p>
        <h3 class="mt-2 text-xl font-semibold text-slate-50 font-['Space_Grotesk']">
          Limpiar checklist?
        </h3>
        <p class="mt-2 text-sm text-slate-300">
          Esta accion borrara el progreso guardado. Deseas continuar?
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            data-action="reset-cancel"
            class="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/40 hover:text-slate-50"
          >
            No
          </button>
          <button
            type="button"
            data-action="reset-confirm"
            class="rounded-full border border-[#7ef0c0]/40 bg-[#7ef0c0]/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ef0c0] transition hover:border-[#7ef0c0]/70 hover:bg-[#7ef0c0]/20"
          >
            Si, limpiar
          </button>
        </div>
      </div>
    </div>
    `:""}
  `}
