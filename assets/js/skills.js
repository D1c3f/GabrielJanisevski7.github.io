/* LD12 – interaktyvus kompetenciju modulis */
document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("competences");
  if (!board) return;
  const KEY = "gabriel-cv-ld12-v1";
  const states = ["Planuojama", "Mokomasi", "Atlikta"];
  const skills = [
    { id:"html", pavadinimas:"HTML", busena:"Atlikta", xp:60 },
    { id:"css", pavadinimas:"CSS", busena:"Atlikta", xp:55 },
    { id:"js", pavadinimas:"JavaScript", busena:"Mokomasi", xp:65 },
    { id:"git", pavadinimas:"Git ir GitHub", busena:"Mokomasi", xp:45 },
    { id:"matlab", pavadinimas:"MATLAB", busena:"Atlikta", xp:50 },
    { id:"sql", pavadinimas:"SQL", busena:"Planuojama", xp:40 },
    { id:"react", pavadinimas:"React", busena:"Planuojama", xp:70 },
    { id:"design", pavadinimas:"UI/UX dizainas", busena:"Mokomasi", xp:35 }
  ];
  const byId = id => document.getElementById(id);
  const columns = {
    Planuojama: byId("ld12-planned"),
    Mokomasi: byId("ld12-learning"),
    Atlikta: byId("ld12-done")
  };
  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!stored || typeof stored !== "object" || Array.isArray(stored)) return;
      skills.forEach(skill => {
        if (Object.hasOwn(stored, skill.id) && states.includes(stored[skill.id])) {
          skill.busena = stored[skill.id];
        }
      });
    } catch (e) { console.warn("LD12: duomenu nuskaitymo klaida", e); }
  }
  function save() {
    try {
      const data = {};
      skills.forEach(skill => { data[skill.id] = skill.busena; });
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { console.warn("LD12: duomenu issaugojimo klaida", e); }
  }
  function getLevel(xp) {
    if (xp >= 300) return {level:4, rank:"Profesionalas", percent:100, remaining:0};
    else if (xp >= 150) return {level:3, rank:"Specialistas", percent:(xp-150)/150*100, remaining:300-xp};
    else if (xp >= 50) return {level:2, rank:"Praktikantas", percent:(xp-50)/100*100, remaining:150-xp};
    else return {level:1, rank:"Pradedantysis", percent:xp/50*100, remaining:50-xp};
  }
  function updateAvatar(level) {
    let file;
    if (level === 1) file = "avatar-level-1.svg";
    else if (level === 2) file = "avatar-level-2.svg";
    else if (level === 3) file = "avatar-level-3.svg";
    else file = "avatar-level-4.svg";
    const avatar = byId("ld12-avatar");
    avatar.src = "assets/img/" + file;
    avatar.alt = "Personažas – " + level + " lygis";
  }
  function updateAchievement(id, unlocked) {
    const element = byId(id);
    element.classList.toggle("ld12-unlocked", unlocked);
    element.classList.toggle("ld12-locked", !unlocked);
    element.setAttribute("data-unlocked", String(unlocked));
    element.querySelector(".ld12-achievement-state").textContent =
      unlocked ? "Atrakinta" : "Neatrakinta";
  }
  function updateProgress() {
    const done = skills.filter(skill => skill.busena === "Atlikta");
    const xp = done.reduce((n,skill) => n + skill.xp, 0);
    const possible = skills.reduce((n,skill) => n + skill.xp, 0);
    const data = getLevel(xp);
    byId("ld12-xp").textContent = xp;
    byId("ld12-max-xp").textContent = possible;
    byId("ld12-level").textContent = data.level;
    byId("ld12-rank").textContent = data.rank;
    byId("ld12-total").textContent = skills.length;
    byId("ld12-completed").textContent = done.length;
    byId("ld12-percent").textContent =
      (done.length / skills.length * 100).toLocaleString("lt-LT",{maximumFractionDigits:1})+"%";
    const bar = byId("ld12-progress-bar");
    bar.style.width = data.percent + "%";
    bar.setAttribute("aria-valuenow", Math.round(data.percent));
    byId("ld12-progress-text").textContent = data.level === 4
      ? "Maksimalus lygis (100 %)"
      : "Iki kito lygio: " + data.remaining + " XP. Šio lygio progresas: " +
        Math.round(data.percent) + " %";
    ["Planuojama","Mokomasi","Atlikta"].forEach((state,index) => {
      byId(["ld12-planned-count","ld12-learning-count","ld12-done-count"][index]).textContent =
        skills.filter(skill => skill.busena === state).length;
    });
    updateAvatar(data.level);
    updateAchievement("ld12-achievement-discoverer", done.length >= 1);
    updateAchievement("ld12-achievement-master", done.length >= 4);
    updateAchievement("ld12-achievement-expert", data.level >= 4);
  }
  function createCard(skill) {
    const card = document.createElement("article");
    card.className = "ld12-card";
    const top = document.createElement("div");
    top.className = "ld12-card-top";
    const name = document.createElement("h4");
    name.textContent = skill.pavadinimas;
    const xp = document.createElement("span");
    xp.className = "ld12-card-xp";
    xp.textContent = skill.xp + " XP";
    top.append(name,xp);
    const label = document.createElement("label");
    label.textContent = "Būsena";
    label.htmlFor = "ld12-state-" + skill.id;
    const select = document.createElement("select");
    select.id = label.htmlFor;
    select.setAttribute("aria-label",skill.pavadinimas + " būsena");
    states.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      option.selected = state === skill.busena;
      select.append(option);
    });
    select.addEventListener("change", () => {
      skill.busena = select.value;
      save();
      renderBoard();
    });
    card.append(top,label,select);
    return card;
  }
  function renderBoard() {
    states.forEach(state => columns[state].replaceChildren());
    skills.forEach(skill => columns[skill.busena].append(createCard(skill)));
    updateProgress();
  }
  restore();
  renderBoard();
});
