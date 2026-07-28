/*
  PUBLIC COUNTDOWN DATE
  ---------------------
  Replace the value below with your intended date and time.

  The recommended format is:
  YYYY-MM-DDTHH:MM:SS+TIMEZONE_OFFSET

  Example for Paris summer time:
  2026-08-15T18:00:00+02:00
*/
const DEFAULT_RELEASE_DATE = "2026-09-25T18:00:00+02:00";

/* Set to false when the website is ready for production. */
const SHOW_SETUP_BUTTON = false;

/*
  CORRECT COORDINATE ANSWERS
  --------------------------
  Replace these six values with the real answers.

  Order:
  1. Latitude degrees
  2. Latitude minutes
  3. Latitude seconds
  4. Longitude degrees
  5. Longitude minutes
  6. Longitude seconds

  Values are compared as number after trimming spaces.
  Examples: "44", "50", "12.4", "0", "34", "8.2"
*/
const DEFAULT_LATITUDE_HEMISPHERE = "N";  // N or S
const DEFAULT_LONGITUDE_HEMISPHERE = "W"; // E or W

const CORRECT_ANSWERS = [
  "46",
  "53",
  "32",
  "0",
  "55",
  "59"
];


/*
  ENIGMAS
  -------
  Replace each title and text with your own puzzle.
  Enigma 1 fills latitude degrees.
  Enigma 2 fills latitude minutes.
  Enigma 3 fills latitude seconds.
  Enigma 4 fills longitude degrees.
  Enigma 5 fills longitude minutes.
  Enigma 6 fills longitude seconds.
*/
const ENIGMAS = [
  {
    number: 1,
    target: "Latitude degrees",
    title: "Enigma 1 — Latitude degrees",
    text: "Write your first enigma here.\nIts answer must be the latitude degrees."
  },
  {
    number: 2,
    target: "Latitude minutes",
    title: "Enigma 2 — Latitude minutes",
    text: "Write your second enigma here.\nIts answer must be the latitude minutes."
  },
  {
    number: 3,
    target: "Latitude seconds",
    title: "Enigma 3 — Latitude seconds",
    text: "Write your third enigma here.\nIts answer must be the latitude seconds."
  },
  {
    number: 4,
    target: "Longitude degrees",
    title: "Enigma 4 — Longitude degrees",
    text: "Write your fourth enigma here.\nIts answer must be the longitude degrees."
  },
  {
    number: 5,
    target: "Longitude minutes",
    title: "Enigma 5 — Longitude minutes",
    text: "Write your fifth enigma here.\nIts answer must be the longitude minutes."
  },
  {
    number: 6,
    target: "Longitude seconds",
    title: "Enigma 6 — Longitude seconds",
    text: "Write your sixth enigma here.\nIts answer must be the longitude seconds."
  }
];

const STORAGE_KEYS = {
  releaseDate: "gps-enigma-release-date",
  answers: "gps-enigma-answers",
  latitudeHemisphere: "gpsLatitudeHemisphere",
  longitudeHemisphere: "gpsLongitudeHemisphere"
};

const countdownView = document.getElementById("countdown-view");
const enigmaView = document.getElementById("enigma-view");
const settingsPanel = document.getElementById("settings-panel");
const settingsToggle = document.getElementById("settings-toggle");
const settingsClose = document.getElementById("settings-close");
const releaseDateInput = document.getElementById("release-date");
const saveDateButton = document.getElementById("save-date");
const previewEnigmasButton = document.getElementById("preview-enigmas");
const previewCountdownButton = document.getElementById("preview-countdown");
const clearAnswersButton = document.getElementById("clear-answers");
const coordinatePreview = document.getElementById("coordinate-preview-value");
const validationMessage = document.getElementById("validation-message");
const openMapsButton = document.getElementById("open-maps");
const latitudeHemisphereLabel = document.getElementById("latitude-hemisphere-label");
const longitudeHemisphereLabel = document.getElementById("longitude-hemisphere-label");
const latitudeHemisphereSelect = document.getElementById("latitude-hemisphere-select");
const longitudeHemisphereSelect = document.getElementById("longitude-hemisphere-select");

const timeElements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

let countdownInterval = null;
let manualPreview = false;

function getReleaseDate() {
  const stored = localStorage.getItem(STORAGE_KEYS.releaseDate);
  const candidate = stored || DEFAULT_RELEASE_DATE;
  const parsed = new Date(candidate);

  if (Number.isNaN(parsed.getTime())) {
    console.error("Invalid release date:", candidate);
    return new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
  }

  return parsed;
}

function formatForDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}

function showCountdown() {
  manualPreview = false;
  countdownView.classList.remove("hidden");
  enigmaView.classList.add("hidden");
  updateCountdown();
}

function showEnigmas(isPreview = false) {
  manualPreview = isPreview;
  countdownView.classList.add("hidden");
  enigmaView.classList.remove("hidden");
}

function updateCountdown() {
  if (manualPreview) return;

  const releaseDate = getReleaseDate();
  const now = new Date();
  const remaining = releaseDate.getTime() - now.getTime();

  if (remaining <= 0) {
    Object.values(timeElements).forEach((element) => {
      element.textContent = "00";
    });

    showEnigmas(false);
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  timeElements.days.textContent = String(days).padStart(2, "0");
  timeElements.hours.textContent = String(hours).padStart(2, "0");
  timeElements.minutes.textContent = String(minutes).padStart(2, "0");
  timeElements.seconds.textContent = String(seconds).padStart(2, "0");
}

function renderEnigmas() {
  const list = document.getElementById("enigma-list");

  list.innerHTML = ENIGMAS.map((enigma) => `
    <article class="enigma-card">
      <div class="enigma-number" aria-label="Enigma ${enigma.number}">
        ${enigma.number}
      </div>
      <div class="enigma-content">
        <h3>${escapeHtml(enigma.title)}</h3>
        <p>${escapeHtml(enigma.text)}</p>
        <span class="enigma-result">
          Answer ${enigma.number} → ${escapeHtml(enigma.target)}
        </span>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAnswerInputs() {
  return Array.from({ length: 6 }, (_, index) =>
    document.getElementById(`answer-${index + 1}`)
  );
}

function saveAnswers() {
  const answers = getAnswerInputs().map((input) => input.value);
  localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(answers));
  updateCoordinatePreview();
  validateAnswers(true);
}

function loadAnswers() {
  let answers = [];

  try {
    answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.answers) || "[]");
  } catch {
    answers = [];
  }

  getAnswerInputs().forEach((input, index) => {
    input.value = answers[index] || "";
  });

  updateCoordinatePreview();
  validateAnswers();
}

function updateCoordinatePreview() {
  const values = getAnswerInputs().map((input) => input.value.trim() || "__");

  coordinatePreview.textContent =
    `${getLatitudeHemisphere()} ${values[0]}° ${values[1]}′ ${values[2]}″ · ` +
    `${getLongitudeHemisphere()} ${values[3]}° ${values[4]}′ ${values[5]}″`;
}


function parseNumericAnswer(value) {
  const normalized = String(value).trim().replace(",", ".");

  if (normalized === "") {
    return null;
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? number : NaN;
}


function getLatitudeHemisphere() {
  return latitudeHemisphereSelect?.value || "N";
}

function getLongitudeHemisphere() {
  return longitudeHemisphereSelect?.value || "E";
}

function updateHemisphereLabels() {
  const latitude = getLatitudeHemisphere();
  const longitude = getLongitudeHemisphere();

  if (latitudeHemisphereLabel) {
    latitudeHemisphereLabel.textContent = latitude;
  }

  if (longitudeHemisphereLabel) {
    longitudeHemisphereLabel.textContent = longitude;
  }
}

function saveHemisphereSettings() {
  localStorage.setItem(STORAGE_KEYS.latitudeHemisphere, getLatitudeHemisphere());
  localStorage.setItem(STORAGE_KEYS.longitudeHemisphere, getLongitudeHemisphere());
  updateHemisphereLabels();
  updateCoordinatePreview();
}

function loadHemisphereSettings() {
  latitudeHemisphereSelect.value = DEFAULT_LATITUDE_HEMISPHERE;
  longitudeHemisphereSelect.value = DEFAULT_LONGITUDE_HEMISPHERE;

  updateHemisphereLabels();
}

function buildGoogleMapsUrl() {
  const values = getAnswerInputs().map((input) => parseNumericAnswer(input.value));

  const latitudeMagnitude =
    Number(values[0]) +
    Number(values[1]) / 60 +
    Number(values[2]) / 3600;

  const longitudeMagnitude =
    Number(values[3]) +
    Number(values[4]) / 60 +
    Number(values[5]) / 3600;

  const latitude =
    getLatitudeHemisphere() === "S"
      ? -latitudeMagnitude
      : latitudeMagnitude;

  const longitude =
    getLongitudeHemisphere() === "W"
      ? -longitudeMagnitude
      : longitudeMagnitude;

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function openGoogleMaps() {
  window.location.assign(buildGoogleMapsUrl());
}

function validateAnswers(automaticallyOpenMaps = false) {
  const inputs = getAnswerInputs();
  let correctCount = 0;
  let filledCount = 0;

  inputs.forEach((input, index) => {
    const wrapper = input.closest(".coordinate-part");
    const value = parseNumericAnswer(input.value);
    const expected = parseNumericAnswer(CORRECT_ANSWERS[index]);

    

    if (value === null) {
      return;
    }

    filledCount += 1;

    if (Number.isFinite(value) && Number.isFinite(expected) && value === expected) {
      
      correctCount += 1;
    } else {
      
    }
  });

  const allCorrect = correctCount === CORRECT_ANSWERS.length;
  openMapsButton.classList.toggle("hidden", !allCorrect);

  

  if (allCorrect) {
    
    

    if (automaticallyOpenMaps) {
      window.setTimeout(openGoogleMaps, 250);
    }
  } else if (filledCount === 0) {
    
  } else {
    
    
  }

  return allCorrect;
}

function toggleSettings(forceOpen) {
  const shouldOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : settingsPanel.classList.contains("hidden");

  settingsPanel.classList.toggle("hidden", !shouldOpen);
  settingsToggle.setAttribute("aria-expanded", String(shouldOpen));
}

settingsToggle.addEventListener("click", () => toggleSettings());
settingsClose.addEventListener("click", () => toggleSettings(false));

saveDateButton.addEventListener("click", () => {
  if (!releaseDateInput.value) return;

  const chosenDate = new Date(releaseDateInput.value);

  if (Number.isNaN(chosenDate.getTime())) return;

  localStorage.setItem(STORAGE_KEYS.releaseDate, chosenDate.toISOString());
  manualPreview = false;
  toggleSettings(false);
  showCountdown();
});

previewEnigmasButton.addEventListener("click", () => {
  toggleSettings(false);
  showEnigmas(true);
});

previewCountdownButton.addEventListener("click", () => {
  toggleSettings(false);
  showCountdown();
});

clearAnswersButton.addEventListener("click", () => {
  getAnswerInputs().forEach((input) => {
    input.value = "";
  });

  localStorage.removeItem(STORAGE_KEYS.answers);
  updateCoordinatePreview();
  validateAnswers();
});

getAnswerInputs().forEach((input) => {
  input.addEventListener("input", saveAnswers);
});

renderEnigmas();
loadHemisphereSettings();
loadAnswers();

if (!SHOW_SETUP_BUTTON) {
  settingsToggle.classList.add("hidden");
  settingsPanel.classList.add("hidden");
}

const initialReleaseDate = getReleaseDate();
releaseDateInput.value = formatForDateTimeLocal(initialReleaseDate);

updateCountdown();
countdownInterval = window.setInterval(updateCountdown, 1000);




latitudeHemisphereSelect?.addEventListener("change", saveHemisphereSettings);
longitudeHemisphereSelect?.addEventListener("change", saveHemisphereSettings);

openMapsButton.addEventListener("click", () => {
  if (!validateAnswers()) return;
  openGoogleMaps();
});
