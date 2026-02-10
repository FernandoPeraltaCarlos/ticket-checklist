import "./style.css";
import { atom } from "nanostores";

type DocRequirement = "si" | "no" | null;
type EnvOption = "p01" | "p02" | "bwe" | "gwe";

type Task = {
  description: string;
  itemPath: string;
  comment: string;
  requireComment: boolean;
};

type ChecklistState = {
  checks: Record<string, boolean>;
  docRequirement: DocRequirement;
  confirmReset: boolean;
  env: EnvOption;
  designLinks: string[];
  tasks: Task[];
};

type Item = {
  id: string;
  label: string;
  type?: "question";
  dependsOn?: { questionId: string; value: DocRequirement };
};

type Step = {
  id: string;
  title: string;
  description: string;
  items: Item[];
};

const STORAGE_KEY = "ticket-checklist-v1";
const DEFAULT_LINKS = [""];
const EMPTY_TASK: Task = {
  description: "",
  itemPath: "",
  comment: "",
  requireComment: false
};

const steps: Step[] = [
  {
    id: "prep",
    title: "1. Preparacion",
    description: "Verifica lo esencial antes de iniciar.",
    items: [
      {
        id: "classification_correct",
        label: "La clasificacion es correcta?"
      },
      {
        id: "assets_included",
        label: "Estan incluidos los assets?"
      },
      {
        id: "queue_correct",
        label: "El queue es correcto?"
      },
      {
        id: "design_link",
        label: "Validar el \"design link\" y confirmar que es procesable"
      },
      { id: "target_date", label: "Confirmar el \"target date\" y su vigencia" },
      {
        id: "requirements",
        label:
          "Revisar requerimientos y trasladarlos a \"productivity suite\" para clarificar solicitudes"
      },
      { id: "attachments", label: "Verificar adjuntos y su completitud" },
      {
        id: "docs_question",
        label: "Se requiere subir documentos?",
        type: "question"
      },
      {
        id: "pii",
        label: "Verificar presencia de PII y lineamientos aplicables",
        dependsOn: { questionId: "docs_question", value: "si" }
      },
      {
        id: "classification",
        label: "Confirmar clasificacion correspondiente",
        dependsOn: { questionId: "docs_question", value: "si" }
      }
    ]
  },
  {
    id: "tasks",
    title: "2. Tareas",
    description: "Registra cada tarea y su contexto.",
    items: []
  },
  {
    id: "delivery",
    title: "3. Entrega",
    description: "Validaciones finales antes del cierre.",
    items: [
      { id: "qa_link", label: "Confirmar inclusion del QA link" },
      { id: "notes", label: "Verificar que las notas esten incluidas" },
      { id: "paths", label: "Confirmar que los item paths estan agregados" },
      {
        id: "date_time",
        label: "Verificar que se registro la fecha y hora de identificacion"
      }
    ]
  }
];

function loadState(): ChecklistState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      checks: {},
      docRequirement: null,
      confirmReset: false,
      env: "p01",
      designLinks: DEFAULT_LINKS,
      tasks: [{ ...EMPTY_TASK }]
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChecklistState> & {
      designLink?: string;
      task?: Partial<Task>;
    };
    const savedLinks =
      Array.isArray(parsed.designLinks) && parsed.designLinks.length > 0
        ? parsed.designLinks
        : parsed.designLink
          ? [parsed.designLink]
          : DEFAULT_LINKS;
    const legacyTasks = parsed.task ? [parsed.task] : [];
    const parsedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : legacyTasks;
    const savedTasks =
      parsedTasks.length > 0
        ? parsedTasks.map((task) => ({
            description: task?.description ?? "",
            itemPath: task?.itemPath ?? "",
            comment: task?.comment ?? "",
            requireComment: task?.requireComment ?? false
          }))
        : [{ ...EMPTY_TASK }];

    return {
      checks: parsed.checks ?? {},
      docRequirement: parsed.docRequirement ?? null,
      confirmReset: false,
      env: parsed.env ?? "p01",
      designLinks: savedLinks,
      tasks: savedTasks
    };
  } catch {
    return {
      checks: {},
      docRequirement: null,
      confirmReset: false,
      env: "p01",
      designLinks: DEFAULT_LINKS,
      tasks: [{ ...EMPTY_TASK }]
    };
  }
}

const checklistStore = atom<ChecklistState>(loadState());

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app not found");
}

const body = document.body;
const updateFooterVisibility = () => {
  body.dataset.atTop = window.scrollY <= 8 ? "true" : "false";
};
window.addEventListener("scroll", updateFooterVisibility, { passive: true });
window.addEventListener("resize", updateFooterVisibility);
updateFooterVisibility();

app.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement | null;
  if (!target) return;

  if (target.matches("input[type='checkbox'][data-check-id]")) {
    const id = target.dataset.checkId;
    if (!id) return;
    const state = checklistStore.get();
    checklistStore.set({
      ...state,
      checks: {
        ...state.checks,
        [id]: target.checked
      }
    });
  }

  if (target.matches("input[type='radio'][name='docRequirement']")) {
    const value = target.value === "si" ? "si" : "no";
    const state = checklistStore.get();
    const nextChecks = { ...state.checks };
    if (value === "no") {
      nextChecks.pii = false;
      nextChecks.classification = false;
    }
    checklistStore.set({
      ...state,
      docRequirement: value,
      checks: nextChecks
    });
  }

  if (target.matches("input[type='checkbox'][data-task-toggle='requireComment']")) {
    const taskIndex = Number(target.dataset.taskIndex ?? "-1");
    if (Number.isNaN(taskIndex)) return;

    const state = checklistStore.get();
    if (!state.tasks[taskIndex]) return;

    const nextTasks = [...state.tasks];
    nextTasks[taskIndex] = {
      ...nextTasks[taskIndex],
      requireComment: target.checked
    };

    checklistStore.set({
      ...state,
      tasks: nextTasks
    });
  }
});

app.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (!target) return;

  if (target.matches("input[type='url'][data-field='designLink']")) {
    const index = Number(target.dataset.index ?? "0");
    const state = checklistStore.get();
    const nextLinks = [...state.designLinks];
    nextLinks[index] = target.value;
    checklistStore.set({ ...state, designLinks: nextLinks });
  }

  if (target.matches("select[data-field='env']")) {
    const value = target.value as EnvOption;
    const state = checklistStore.get();
    checklistStore.set({ ...state, env: value });
  }

  if (target.matches("input[data-task-field], textarea[data-task-field]")) {
    const field = target.dataset.taskField as keyof Task | undefined;
    const taskIndex = Number(target.dataset.taskIndex ?? "-1");
    if (!field || Number.isNaN(taskIndex)) return;

    const state = checklistStore.get();
    if (!state.tasks[taskIndex]) return;

    const nextTasks = [...state.tasks];
    nextTasks[taskIndex] = {
      ...nextTasks[taskIndex],
      [field]: target.value
    };
    checklistStore.set({ ...state, tasks: nextTasks });
  }
});

app.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const actionEl = target.closest<HTMLElement>("[data-action]");
  if (!actionEl) return;
  if (actionEl.dataset.action === "reset") {
    const state = checklistStore.get();
    checklistStore.set({ ...state, confirmReset: true });
  }
  if (actionEl.dataset.action === "reset-confirm") {
    localStorage.removeItem(STORAGE_KEY);
    checklistStore.set({
      checks: {},
      docRequirement: null,
      confirmReset: false,
      env: "p01",
      designLinks: DEFAULT_LINKS,
      tasks: [{ ...EMPTY_TASK }]
    });
  }
  if (actionEl.dataset.action === "reset-cancel") {
    const state = checklistStore.get();
    checklistStore.set({ ...state, confirmReset: false });
  }
  if (actionEl.dataset.action === "add-design-link") {
    const state = checklistStore.get();
    checklistStore.set({
      ...state,
      designLinks: [...state.designLinks, ""]
    });
  }
  if (actionEl.dataset.action === "add-task") {
    const state = checklistStore.get();
    checklistStore.set({
      ...state,
      tasks: [...state.tasks, { ...EMPTY_TASK }]
    });
  }
  if (actionEl.dataset.action === "delete-task") {
    const taskIndex = Number(actionEl.dataset.taskIndex ?? "-1");
    if (Number.isNaN(taskIndex)) return;
    const state = checklistStore.get();
    const nextTasks = state.tasks.filter((_, index) => index !== taskIndex);
    const finalTasks = nextTasks.length > 0 ? nextTasks : [{ ...EMPTY_TASK }];
    checklistStore.set({
      ...state,
      tasks: finalTasks
    });
  }
});

let renderTimeout: number | null = null;

checklistStore.subscribe((value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

  if (renderTimeout !== null) {
    window.clearTimeout(renderTimeout);
  }

  renderTimeout = window.setTimeout(() => {
    render(value);
    renderTimeout = null;
  }, 250);
});

function isVisible(item: Item, state: ChecklistState): boolean {
  if (!item.dependsOn) return true;
  if (item.dependsOn.questionId === "docs_question") {
    return state.docRequirement === item.dependsOn.value;
  }
  return true;
}

function taskProgress(task: Task) {
  const total = task.requireComment ? 3 : 2;
  const doneBase =
    (task.description.trim() ? 1 : 0) +
    (task.itemPath.trim() ? 1 : 0);
  const doneComment = task.requireComment && task.comment.trim() ? 1 : 0;
  const done = doneBase + doneComment;
  return { total, done };
}

function isTaskComplete(task: Task): boolean {
  const hasBase = task.description.trim().length > 0 && task.itemPath.trim().length > 0;
  if (!task.requireComment) return hasBase;
  return hasBase && task.comment.trim().length > 0;
}

function progress(state: ChecklistState) {
  const visibleItems = steps.flatMap((step) =>
    step.items.filter((item) => item.type !== "question" && isVisible(item, state))
  );
  const checklistTotal = visibleItems.length;
  const checklistDone = visibleItems.reduce(
    (count, item) => count + (state.checks[item.id] ? 1 : 0),
    0
  );
  const tasksTotal = state.tasks.length;
  const tasksDone = state.tasks.reduce(
    (count, task) => count + (isTaskComplete(task) ? 1 : 0),
    0
  );
  const total = checklistTotal + tasksTotal;
  const done = checklistDone + tasksDone;
  return { total, done };
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function convertToDevLink(raw: string, env: EnvOption) {
  if (!raw.trim()) {
    return { output: "", status: "" };
  }

  const withProtocol = raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return { output: "", status: "URL invalida" };
  }

  const domainMap: Record<string, { country?: string; countryInPath?: boolean }> = {
    "www.business.hsbc.uk": { country: "uk" },
    "www.business.hsbc.fr": { country: "fr" },
    "www.europe.business.hsbc.com": { countryInPath: true }
  };

  const entry = domainMap[url.hostname];
  if (!entry) {
    return { output: "", status: "Dominio no reconocido" };
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const country = entry.countryInPath ? segments[0] : entry.country ?? "";
  const language = entry.countryInPath ? segments[1] ?? "" : segments[0] ?? "";
  const rest = entry.countryInPath ? segments.slice(2).join("/") : segments.slice(1).join("/");

  if (!country) {
    return { output: "", status: "Pais no encontrado en la URL" };
  }

  if (!language) {
    return { output: "", status: "Idioma no encontrado en la URL" };
  }

  const base = `https://link.${country}.dev.${env}.hsbc/${language}`;
  const path = rest ? `/${rest}` : "";
  const output = `${base}${path}${url.search}${url.hash}`;

  return { output, status: `Listo | entorno ${env}` };
}

function render(state: ChecklistState) {
  if (!app) return;

  const { total, done } = progress(state);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const remaining = Math.max(total - done, 0);
  const devLinks = state.designLinks.map((link) =>
    convertToDevLink(link, state.env)
  );
  const firstError = devLinks.find(
    (result, index) => state.designLinks[index]?.trim() && result.status !== `Listo | entorno ${state.env}`
  );
  const hasAnyInput = state.designLinks.some((link) => link.trim().length > 0);
  const overallStatus = firstError
    ? firstError.status
    : hasAnyInput
      ? `Listo | entorno ${state.env}`
      : "Ingresa un link para generar la version de desarrollo.";

  app.innerHTML = `
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
                <p class="mt-1 text-2xl font-semibold text-slate-100">${done} / ${total} items</p>
              </div>
              <div class="flex w-full flex-col gap-3 md:w-64">
                <div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${percent}%"></div>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">${percent}% completado</p>
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
                      ${(["p01", "p02", "bwe", "gwe"] as EnvOption[])
                        .map(
                          (option) =>
                            `<option value="${option}" ${
                              state.env === option ? "selected" : ""
                            }>${option}</option>`
                        )
                        .join("")}
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
                ${state.designLinks
                  .map((link, index) => {
                    const result = devLinks[index];
                    return `
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="grid gap-2 text-sm text-slate-300">
                        <span class="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Link live ${index + 1}
                        </span>
                        <input
                          type="url"
                          data-field="designLink"
                          data-index="${index}"
                          placeholder="https://www.business.hsbc.uk/en-gb/..."
                          value="${escapeAttr(link)}"
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
                          value="${escapeAttr(result.output)}"
                          class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none"
                        />
                      </label>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
              <p class="text-xs text-slate-500">
                ${overallStatus}
              </p>
            </div>
          </div>
        </header>

        <section class="grid gap-6">
          ${steps
            .map((step) => {
              if (step.id === "tasks") {
                return `
                  <article class="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 class="text-xl font-semibold text-slate-50 font-['Space_Grotesk']">${step.title}</h2>
                        <p class="mt-1 text-sm text-slate-400">${step.description}</p>
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
                      ${state.tasks
                        .map((task, index) => {
                          const taskStats = taskProgress(task);
                          const taskPercent = Math.round((taskStats.done / taskStats.total) * 100);
                          return `
                            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                              <div class="mb-3 flex items-center justify-between gap-3">
                                <p class="text-sm font-medium text-slate-100">Tarea ${index + 1}</p>
                                <button
                                  type="button"
                                  data-action="delete-task"
                                  data-task-index="${index}"
                                  class="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-rose-300/40 hover:text-rose-200"
                                >
                                  Eliminar
                                </button>
                              </div>
                              <div class="mb-4">
                                <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                  <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${taskPercent}%"></div>
                                </div>
                                <p class="mt-1 text-xs text-slate-400">${taskStats.done} / ${taskStats.total} campos completados</p>
                              </div>
                              <div class="grid gap-3">
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs tracking-[0.12em] text-slate-500">Descripcion *</span>
                                  <input
                                    type="text"
                                    data-task-field="description"
                                    data-task-index="${index}"
                                    placeholder="Describe la tarea..."
                                    value="${escapeAttr(task.description)}"
                                    class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  />
                                </label>
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs tracking-[0.12em] text-slate-500">Item path *</span>
                                  <input
                                    type="text"
                                    data-task-field="itemPath"
                                    data-task-index="${index}"
                                    placeholder="Ej: /home/dashboard/settings"
                                    value="${escapeAttr(task.itemPath)}"
                                    class="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  />
                                </label>
                                <label class="inline-flex items-center gap-2 text-xs tracking-[0.12em] text-slate-400">
                                  <input
                                    type="checkbox"
                                    data-task-toggle="requireComment"
                                    data-task-index="${index}"
                                    ${task.requireComment ? "checked" : ""}
                                    class="h-4 w-4 rounded border-white/30 bg-white/10"
                                  />
                                  <span>Require comentarios</span>
                                </label>
                                ${
                                  task.requireComment
                                    ? `
                                <label class="grid gap-2 text-sm text-slate-300">
                                  <span class="text-xs tracking-[0.12em] text-slate-500">Si existe error u observacion, agrega comentario *</span>
                                  <textarea
                                    data-task-field="comment"
                                    data-task-index="${index}"
                                    placeholder="Comentario requerido"
                                    rows="3"
                                    required
                                    class="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-white/40"
                                  >${escapeAttr(task.comment)}</textarea>
                                </label>
                                    `
                                    : ""
                                }
                              </div>
                            </div>
                          `;
                        })
                        .join("")}
                    </div>
                  </article>
                `;
              }

              const itemsMarkup = step.items
                .map((item) => {
                  if (item.type === "question") {
                    return `
                      <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                        <p class="text-sm font-medium text-slate-100">${item.label}</p>
                        <p class="mt-1 text-xs text-slate-400">Selecciona si o no para continuar.</p>
                        <div class="mt-3 flex flex-wrap gap-4 text-sm text-slate-200">
                          <label class="flex items-center gap-2">
                            <input type="radio" name="docRequirement" value="no" ${
                              state.docRequirement === "no" ? "checked" : ""
                            } />
                            <span>No, nada seguimos</span>
                          </label>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="docRequirement" value="si" ${
                              state.docRequirement === "si" ? "checked" : ""
                            } />
                            <span>Si</span>
                          </label>
                        </div>
                      </div>
                    `;
                  }

                  const isChecked = Boolean(state.checks[item.id]);
                  const wrapperOpen = !item.dependsOn || isVisible(item, state);
                  const wrapperStart = item.dependsOn
                    ? `<div class="reveal" data-visible="${wrapperOpen}">`
                    : "";
                  const wrapperEnd = item.dependsOn ? `</div>` : "";

                  return `
                    ${wrapperStart}
                    <label class="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/30">
                      <input
                        type="checkbox"
                        data-check-id="${item.id}"
                        class="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
                        ${isChecked ? "checked" : ""}
                      />
                      <span class="text-sm text-slate-200 group-hover:text-slate-100 ${
                        isChecked ? "task-checked" : ""
                      }">${item.label}</span>
                    </label>
                    ${wrapperEnd}
                  `;
                })
                .join("");

              return `
                <article class="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(21,24,33,0.92),_rgba(11,12,15,0.92))] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  <div class="mb-5">
                    <h2 class="text-xl font-semibold text-slate-50 font-['Space_Grotesk']">${step.title}</h2>
                    <p class="mt-1 text-sm text-slate-400">${step.description}</p>
                  </div>
                  <div class="grid gap-3">${itemsMarkup}</div>
                </article>
              `;
            })
            .join("")}
        </section>
      </div>
      <div class="footer-bar sticky bottom-4 mt-10">
        <div class="mx-auto max-w-4xl rounded-full border border-white/10 bg-black/50 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur">
          <div class="flex flex-wrap items-center gap-4">
            <div class="min-w-[180px] flex-1">
              <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full bg-[#7ef0c0]" style="width: ${percent}%"></div>
              </div>
              <p class="mt-2 text-xs text-slate-400">${remaining} pendientes</p>
            </div>
            <div class="text-sm font-semibold text-slate-100">
              ${done} / ${total}
            </div>
          </div>
        </div>
      </div>
    </main>
    ${
      state.confirmReset
        ? `
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
    `
        : ""
    }
  `;
}
