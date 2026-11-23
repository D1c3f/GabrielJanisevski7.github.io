/**
 * VILNIUS TECH – Skriptinis programavimas – LD11
 * Formos tikrinimas, lietuviško telefono formatavimas,
 * duomenų atvaizdavimas ir vidurkio skaičiavimas.
 * Forma neatlieka tinklo užklausų ir duomenų nesaugo serveryje.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("ld11-contact-form");
    if (!form) return;

    const fieldIds = [
      "ld11-first-name",
      "ld11-last-name",
      "ld11-email",
      "ld11-phone",
      "ld11-address",
      "ld11-rating-1",
      "ld11-rating-2",
      "ld11-rating-3"
    ];
    const fields = Object.fromEntries(
      fieldIds.map((id) => [id, document.getElementById(id)])
    );
    const touched = new Set();
    const submitButton = document.getElementById("ld11-submit");
    const clearButton = document.getElementById("ld11-clear");
    const results = document.getElementById("ld11-results");
    const resultFields = document.getElementById("ld11-result-fields");
    const averageText = document.getElementById("ld11-average");

    // Paliekami tik skaitmenys. Įvedant 061234567 arba +370 612 34567
    // gaunamas tas pats lietuviškas formatas: +370 612 34567.
    function formatPhone(value) {
      let digits = value.replace(/\D/g, "");
      if (!digits) return "";
      if (digits.startsWith("370")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("0") || digits.startsWith("8")) {
        digits = digits.slice(1);
      }
      digits = digits.slice(0, 8);
      if (!digits) return "";
      return "+370 " + digits.slice(0, 3) +
        (digits.length > 3 ? " " + digits.slice(3) : "");
    }

    // Grąžina klaidos tekstą arba tuščią eilutę.
    function validationError(id) {
      const value = fields[id].value.trim();

      if (!value) return "Šis laukas yra privalomas.";

      if (id === "ld11-first-name" || id === "ld11-last-name") {
        if (!/^\p{L}+$/u.test(value)) {
          return "Leidžiamos tik raidės (be skaičių ir simbolių).";
        }
      }

      if (id === "ld11-email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          return "Įveskite taisyklingą el. pašto adresą.";
        }
      }

      if (id === "ld11-phone") {
        if (!/^\+370 6\d{2} \d{5}$/.test(value)) {
          return "Numerio formatas: +370 6xx xxxxx.";
        }
      }

      if (id.startsWith("ld11-rating-")) {
        if (!/^(10|[1-9])$/.test(value)) {
          return "Įveskite sveikąjį skaičių nuo 1 iki 10.";
        }
      }

      return "";
    }

    function showFieldState(id) {
      const element = fields[id];
      const errorElement = document.getElementById(id + "-error");
      const error = touched.has(id) ? validationError(id) : "";
      errorElement.textContent = error;
      element.classList.toggle("ld11-invalid", Boolean(error));
      element.setAttribute("aria-invalid", error ? "true" : "false");
    }

    function updateSubmitState() {
      submitButton.disabled = fieldIds.some((id) => validationError(id) !== "");
    }

    function hideResults() {
      results.hidden = true;
      resultFields.replaceChildren();
      averageText.textContent = "";
    }

    fieldIds.forEach(function (id) {
      fields[id].addEventListener("input", function () {
        if (id === "ld11-phone") {
          fields[id].value = formatPhone(fields[id].value);
        }
        touched.add(id);
        showFieldState(id);
        updateSubmitState();
        hideResults();
      });

      fields[id].addEventListener("blur", function () {
        touched.add(id);
        showFieldState(id);
        updateSubmitState();
      });
    });

    function addResult(label, value) {
      const line = document.createElement("p");
      line.className = "ld11-result-line";
      // textContent apsaugo nuo naudotojo HTML kodo vykdymo.
      line.textContent = label + ": " + value;
      resultFields.appendChild(line);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Puslapis neperkraunamas.

      fieldIds.forEach((id) => {
        touched.add(id);
        showFieldState(id);
      });
      updateSubmitState();
      if (submitButton.disabled) return;

      const rating1 = Number(fields["ld11-rating-1"].value);
      const rating2 = Number(fields["ld11-rating-2"].value);
      const rating3 = Number(fields["ld11-rating-3"].value);
      const average = (rating1 + rating2 + rating3) / 3;

      const duomenys = {
        vardas: fields["ld11-first-name"].value.trim(),
        pavarde: fields["ld11-last-name"].value.trim(),
        elPastas: fields["ld11-email"].value.trim(),
        telefonoNumeris: fields["ld11-phone"].value.trim(),
        adresas: fields["ld11-address"].value.trim(),
        vertinimai: {
          dizainas: rating1,
          aiskumas: rating2,
          patogumas: rating3
        },
        vidurkis: Number(average.toFixed(2))
      };

      console.log("LD11 formos duomenų objektas:", duomenys);

      hideResults();
      addResult("Vardas", duomenys.vardas);
      addResult("Pavardė", duomenys.pavarde);
      addResult("El. paštas", duomenys.elPastas);
      addResult("Tel. numeris", duomenys.telefonoNumeris);
      addResult("Adresas", duomenys.adresas);
      addResult("1. Svetainės dizainas", duomenys.vertinimai.dizainas);
      addResult("2. Informacijos aiškumas", duomenys.vertinimai.aiskumas);
      addResult("3. Svetainės patogumas", duomenys.vertinimai.patogumas);
      averageText.textContent =
        duomenys.vardas + " " + duomenys.pavarde +
        ": " + average.toFixed(2);
      results.hidden = false;
    });

    // Išvalomi laukai, klaidos, ankstesni duomenys ir vidurkis be perkrovimo.
    clearButton.addEventListener("click", function () {
      form.reset();
      touched.clear();
      fieldIds.forEach(function (id) {
        fields[id].classList.remove("ld11-invalid");
        fields[id].setAttribute("aria-invalid", "false");
        document.getElementById(id + "-error").textContent = "";
      });
      hideResults();
      updateSubmitState();
    });

    updateSubmitState();
  });
})();
