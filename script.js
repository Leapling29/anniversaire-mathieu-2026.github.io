/* ---------- PERMANENT WEBSITE CONFIGURATION ---------- */
const SHOW_SETUP_BUTTON = false;
const DEFAULT_LATITUDE_HEMISPHERE = "N";
const DEFAULT_LONGITUDE_HEMISPHERE = "W";

const CORRECT_ANSWERS = [
  "46",
  "53",
  "32",
  "0",
  "55",
  "59"
];

/*
  Set each revealDate to the day and time when that enigma should appear.
  Paris summer-time example: 2026-08-15T18:00:00+02:00
*/

// // DEBUG
// const DEFAULT_ENIGMAS = [
//   { number: 1, target: "Latitude degrees", revealDate: "2026-01-25T17:00:00+02:00", title: "Enigma 1", text: "Write your first enigma here." },
//   { number: 2, target: "Latitude minutes", revealDate: "2026-01-24T23:00:00+02:00", title: "Enigma 2", text: "Write your second enigma here." },
//   { number: 3, target: "Latitude seconds", revealDate: "2026-01-01T17:00:00+02:00", title: "Enigma 3: Le programmeur", text: "0101 0001 0101 0000" },
//   { number: 4, target: "Longitude degrees", revealDate: "2026-01-17T16:00:00+02:00", title: "Enigma 4", text: "Write your fourth enigma here." },
//   { number: 5, target: "Longitude minutes", revealDate: "2026-01-06T12:00:00+02:00", title: "Enigma 5", text: "Write your fifth enigma here." },
//   { number: 6, target: "Longitude seconds", revealDate: "2026-01-14T07:00:00+02:00", title: "Enigma 6", text: "Write your sixth enigma here." }
// ];

const DEFAULT_ENIGMAS = [
  { number: 1, target: "Latitude degrees", revealDate: "2026-09-25T17:00:00+02:00", title: "Enigma 1", text: "Write your first enigma here." },
  { number: 2, target: "Latitude minutes", revealDate: "2026-08-24T23:00:00+02:00", title: "Enigma 2", text: "Write your second enigma here." },
  { number: 3, target: "Latitude seconds", revealDate: "2026-08-01T17:00:00+02:00", title: "Enigma 3: Le programmeur", text: "0101 0001 0101 0000" },
  { number: 4, target: "Longitude degrees", revealDate: "2026-09-17T16:00:00+02:00", title: "Enigma 4", text: "Write your fourth enigma here." },
  { number: 5, target: "Longitude minutes", revealDate: "2026-09-06T12:00:00+02:00", title: "Enigma 5", text: "Write your fifth enigma here." },
  { number: 6, target: "Longitude seconds", revealDate: "2026-08-14T07:00:00+02:00", title: "Enigma 6", text: "Write your sixth enigma here." }
];

const STORAGE_KEYS = {
  answers: "gps-mystery-answers",
  revealDates: "gps-mystery-reveal-dates",
  latitudeHemisphere: "gps-mystery-latitude-hemisphere",
  longitudeHemisphere: "gps-mystery-longitude-hemisphere"
};

const $ = (id) => document.getElementById(id);
const timeElements = { days: $("days"), hours: $("hours"), minutes: $("minutes"), seconds: $("seconds") };
const enigmaList = $("enigma-list");
const coordinatePreview = $("coordinate-preview-value");
const openMapsButton = $("open-maps");
const settingsPanel = $("settings-panel");
const settingsToggle = $("settings-toggle");
const latitudeSelect = $("latitude-hemisphere-select");
const longitudeSelect = $("longitude-hemisphere-select");
let hasRedirected = false;

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getAnswerInputs() {
  return Array.from({ length: 6 }, (_, index) => $(`answer-${index + 1}`));
}

function parseNumber(value) {
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : NaN;
}

function getRevealDates() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.revealDates) || "null");
    if (Array.isArray(saved) && saved.length === DEFAULT_ENIGMAS.length) return saved;
  } catch {}
  return DEFAULT_ENIGMAS.map((enigma) => enigma.revealDate);
}

function getEnigmas() {
  const revealDates = getRevealDates();
  return DEFAULT_ENIGMAS.map((enigma, index) => ({ ...enigma, revealDate: revealDates[index] }));
}


function getLatitudeHemisphere() { return latitudeSelect.value; }
function getLongitudeHemisphere() { return longitudeSelect.value; }

function loadSettings() {
  latitudeSelect.value = localStorage.getItem(STORAGE_KEYS.latitudeHemisphere) || DEFAULT_LATITUDE_HEMISPHERE;
  longitudeSelect.value = localStorage.getItem(STORAGE_KEYS.longitudeHemisphere) || DEFAULT_LONGITUDE_HEMISPHERE;
  updateHemisphereLabels();
}

function updateHemisphereLabels() {
  $("latitude-hemisphere-label").textContent = getLatitudeHemisphere();
  $("longitude-hemisphere-label").textContent = getLongitudeHemisphere();
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date);
}

function formatForDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderEnigmas() {
  const now = Date.now();
  const enigmas = getEnigmas();

  enigmaList.innerHTML = enigmas.map((enigma) => {
    const reveal = new Date(enigma.revealDate);
    const unlocked = !Number.isNaN(reveal.getTime()) && now >= reveal.getTime();

    if (unlocked) {
      return `<article class="enigma-card revealed">
        <div class="enigma-number">${enigma.number}</div>
        <div class="enigma-content">
          <div class="status-line"><span class="status-badge">Revealed</span><time>${escapeHtml(formatDate(reveal))}</time></div>
          <h3>${escapeHtml(enigma.title)}</h3>
          <p>${escapeHtml(enigma.text).replaceAll("\n", "<br>")}</p>
          <span class="enigma-result">Answer ${enigma.number} → ${escapeHtml(enigma.target)}</span>
        </div>
      </article>`;
    }

    return `<article class="enigma-card locked">
      <div class="enigma-number">${enigma.number}</div>
      <div class="enigma-content">
        <div class="status-line"><span class="status-badge">Locked</span></div>
        <h3>Enigma ${enigma.number} is still hidden</h3>
        <p>It will appear on <strong>${escapeHtml(formatDate(reveal))}</strong>.</p>
        <span class="enigma-result">Future answer → ${escapeHtml(enigma.target)}</span>
      </div>
    </article>`;
  }).join("");
  updateCoordinateLocks();
}

function updateCoordinateLocks() {
  const now = Date.now();
  const enigmas = getEnigmas();

  getAnswerInputs().forEach((input, index) => {
    const revealTime = new Date(enigmas[index].revealDate).getTime();
    const unlocked = Number.isFinite(revealTime) && now >= revealTime;
    const wrapper = input.closest(".coordinate-part");

    input.disabled = !unlocked;
    input.placeholder = unlocked ? "" : "Locked";
    wrapper.classList.toggle("is-locked", !unlocked);

    if (!unlocked) {
      wrapper.classList.remove("is-correct", "is-incorrect");
    }
  });
}

function updateCountdown() {
  const now = Date.now();
  const nextEnigma = getEnigmas()
    .map((enigma) => ({ ...enigma, revealTime: new Date(enigma.revealDate).getTime() }))
    .filter((enigma) => Number.isFinite(enigma.revealTime) && enigma.revealTime > now)
    .sort((a, b) => a.revealTime - b.revealTime)[0];

  if (!nextEnigma) {
    Object.values(timeElements).forEach((element) => element.textContent = "00");
    $("countdown-eyebrow").textContent = "All enigmas revealed";
    $("countdown-title").textContent = "The final mystery is now unlocked";
    $("next-release-label").textContent = "";
    return;
  }

  const remaining = nextEnigma.revealTime - now;
  const totalSeconds = Math.floor(remaining / 1000);
  timeElements.days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, "0");
  timeElements.hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
  timeElements.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  timeElements.seconds.textContent = String(totalSeconds % 60).padStart(2, "0");
  $("countdown-eyebrow").textContent = `Enigma ${nextEnigma.number} arrives in`;
  $("countdown-title").textContent = "The mystery continues";
  $("next-release-label").textContent = formatDate(new Date(nextEnigma.revealTime));
}

function updateTimeline() {
  updateCountdown();
  renderEnigmas();
  validateAnswers();
}

function saveAnswers() {
  localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(getAnswerInputs().map((input) => input.value)));
  updateCoordinatePreview();
  validateAnswers(true);
}

function loadAnswers() {
  let answers = [];
  try { answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.answers) || "[]"); } catch {}
  getAnswerInputs().forEach((input, index) => input.value = answers[index] || "");
  updateCoordinatePreview();
}

function updateCoordinatePreview() {
  const values = getAnswerInputs().map((input) => input.value.trim() || "__");
  coordinatePreview.textContent = `${getLatitudeHemisphere()} ${values[0]}° ${values[1]}′ ${values[2]}″ · ${getLongitudeHemisphere()} ${values[3]}° ${values[4]}′ ${values[5]}″`;
}

function allAnswersCorrect() {
  return getAnswerInputs().every((input, index) => {
    const value = parseNumber(input.value);
    const expected = parseNumber(CORRECT_ANSWERS[index]);
    return value !== null && Number.isFinite(value) && value === expected;
  });
}

function buildGoogleMapsUrl() {
  const values = getAnswerInputs().map((input) => parseNumber(input.value));
  const latMagnitude = values[0] + values[1] / 60 + values[2] / 3600;
  const lonMagnitude = values[3] + values[4] / 60 + values[5] / 3600;
  const latitude = getLatitudeHemisphere() === "S" ? -latMagnitude : latMagnitude;
  const longitude = getLongitudeHemisphere() === "W" ? -lonMagnitude : lonMagnitude;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function validateAnswers(autoOpen = false) {
  const inputs = getAnswerInputs();
  const enigmas = getEnigmas();
  const now = Date.now();
  let allUnlocked = true;
  let allCorrect = true;

  inputs.forEach((input, index) => {
    const wrapper = input.closest(".coordinate-part");
    const revealTime = new Date(enigmas[index].revealDate).getTime();
    const unlocked = Number.isFinite(revealTime) && now >= revealTime;

    wrapper.classList.remove("is-correct", "is-incorrect");

    if (!unlocked) {
      allUnlocked = false;
      allCorrect = false;
      return;
    }

    const value = parseNumber(input.value);
    const expected = parseNumber(CORRECT_ANSWERS[index]);

    if (value === null) {
      allCorrect = false;
      return;
    }

    if (Number.isFinite(value) && value === expected) {
      wrapper.classList.add("is-correct");
    } else {
      wrapper.classList.add("is-incorrect");
      allCorrect = false;
    }
  });

  const complete = allUnlocked && allCorrect;
  openMapsButton.classList.toggle("hidden", !complete);

  if (complete && autoOpen && !hasRedirected) {
    hasRedirected = true;
    window.setTimeout(() => window.location.assign(buildGoogleMapsUrl()), 300);
  }

  return complete;
}

function renderSetupDates() {
  $("reveal-date-settings").innerHTML = getEnigmas().map((enigma) => {
    const date = new Date(enigma.revealDate);
    return `<label class="setup-field"><span>Enigma ${enigma.number}</span><div class="date-input-wrapper"><input id="reveal-date-${enigma.number}" type="datetime-local" value="${formatForDateTimeLocal(date)}"></div></label>`;
  }).join("");
}

function saveSetup() {
  const dates = DEFAULT_ENIGMAS.map((enigma) => $(`reveal-date-${enigma.number}`).value);
  if (dates.some((value) => !value)) {
    alert("Please choose a reveal date for every enigma.");
    return;
  }
  localStorage.setItem(STORAGE_KEYS.revealDates, JSON.stringify(dates.map((value) => new Date(value).toISOString())));
  localStorage.setItem(STORAGE_KEYS.latitudeHemisphere, getLatitudeHemisphere());
  localStorage.setItem(STORAGE_KEYS.longitudeHemisphere, getLongitudeHemisphere());
  updateHemisphereLabels();
  updateCoordinatePreview();
  updateTimeline();
  settingsPanel.classList.add("hidden");
}

getAnswerInputs().forEach((input) => input.addEventListener("input", saveAnswers));
latitudeSelect.addEventListener("change", () => { updateHemisphereLabels(); updateCoordinatePreview(); });
longitudeSelect.addEventListener("change", () => { updateHemisphereLabels(); updateCoordinatePreview(); });
openMapsButton.addEventListener("click", () => { if (validateAnswers()) window.location.assign(buildGoogleMapsUrl()); });
$("clear-answers").addEventListener("click", () => { getAnswerInputs().forEach((input) => input.value = ""); localStorage.removeItem(STORAGE_KEYS.answers); hasRedirected = false; updateCoordinatePreview(); validateAnswers(); });
settingsToggle.addEventListener("click", () => { settingsPanel.classList.toggle("hidden"); renderSetupDates(); });
$("settings-close").addEventListener("click", () => settingsPanel.classList.add("hidden"));
$("save-settings").addEventListener("click", saveSetup);
$("reset-settings").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEYS.revealDates); localStorage.removeItem(STORAGE_KEYS.latitudeHemisphere); localStorage.removeItem(STORAGE_KEYS.longitudeHemisphere); location.reload(); });

if (!SHOW_SETUP_BUTTON) settingsToggle.classList.add("hidden");
loadSettings();
loadAnswers();
renderSetupDates();
updateTimeline();
window.setInterval(updateTimeline, 1000);
