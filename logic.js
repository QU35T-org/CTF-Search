var searchResultFormat =
  '<tr><td>$category</td><td><a href="$ressources_link" target="_blank">$challenge</a></td><td><a href="$link" target="_blank">Link</a></td><td align="left">$tags</td></tr>';
var totalLimit = 250;

var controls = {
  oldColor: "",
  displayResults: function () {
    if (results.style) {
      results.style.display = "";
    }
    resultsTableHideable.classList.remove("hide");
  },
  hideResults: function () {
    if (results.style) {
      results.style.display = "none";
    }
  },
  doSearch: function (match, dataset) {
    results = [];

    words = match.toLowerCase();
    words = words.split(" ");
    regex = "";
    posmatch = [];
    negmatch = [];
    for (i = 0; i < words.length; i++) {
      if (words[i][0] != "-") {
        posmatch.push(words[i]);
        regex += "(?=.*" + words[i] + ")";
      } else {
        negmatch.push(words[i].substring(1));
      }
    }
    if (negmatch.length > 0) {
      regex += "(^((?!(";
      for (i = 0; i < negmatch.length; i++) {
        regex += negmatch[i];
        if (i != negmatch.length - 1) {
          regex += "|";
        }
      }
      regex += ")).)*$)";
    }

    dataset.forEach((e) => {
      searchTerm = (e.category + e.challenge + e.tags)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "");
      if (searchTerm.match(regex)) results.push(e);
    });
    return results;
  },
  updateResults: function (loc, results) {
    if (results.length == 0) {
      noResults.style.display = "";
      noResults.textContent = "No Results Found";

      resultsTableHideable.classList.add("hide");
    } else if (results.length > totalLimit) {
      noResults.style.display = "";
      resultsTableHideable.classList.add("hide");
      noResults.textContent =
        "Error: " +
        results.length +
        " results were found, try being more specific";
      this.setColor(colorUpdate, "too-many-results");
    } else {
      var tableRows = loc.getElementsByTagName("tr");
      for (var x = tableRows.length - 1; x >= 0; x--) {
        loc.removeChild(tableRows[x]);
      }

      noResults.style.display = "none";
      resultsTableHideable.classList.remove("hide");

      results.forEach((r) => {
        el = searchResultFormat
          .replace("$category", r.category)
          .replace("$ressources_link", r.ressources_link)
          .replace("$challenge", r.challenge)
          .replace("$link", r.link)
          .replace("$tags", r.tags);

        var wrapper = document.createElement("table");
        wrapper.innerHTML = el;
        var div = wrapper.querySelector("tr");

        loc.appendChild(div);
      });
    }
  },
  setColor: function (loc, indicator) {
    if (this.oldColor == indicator) return;
    var colorTestRegex = /^color-/i;

    loc.classList.forEach((cls) => {
      if (cls.match(colorTestRegex)) loc.classList.remove(cls);
    });
    loc.classList.add("color-" + indicator);
    this.oldColor = indicator;
  },
};
window.controls = controls;

document.addEventListener("DOMContentLoaded", function () {
  results = document.querySelector("div.results");
  searchValue = document.querySelector("input.search");
  form = document.querySelector("form.searchForm");
  resultsTableHideable = document
    .getElementsByClassName("results-table")
    .item(0);
  resultsTable = document.querySelector("tbody.results");
  resultsTable = document.querySelector("tbody.results");
  noResults = document.querySelector("div.noResults");
  colorUpdate = document.body;

  document.body.classList.add("fade");

  var currentSet = [];
  var oldSearchValue = "";

  function doSearch(event) {
    var val = searchValue.value;

    if (val != "") {
      controls.displayResults();
      currentSet = window.dataset;
      oldSearchValue = val;

      currentSet = window.controls.doSearch(val, currentSet);
      if (currentSet.length < totalLimit)
        window.controls.setColor(
          colorUpdate,
          currentSet.length == 0 ? "no-results" : "results-found"
        );

      window.controls.updateResults(resultsTable, currentSet);
    } else {
      controls.displayResults();
      window.controls.setColor(colorUpdate, "no-search");
      currentSet = window.dataset;
      resultsTableHideable.classList.add("hide");
    }

    if (event.type == "submit") event.preventDefault();
  }

  fetch("./dataset.json")
    .then((res) => res.json())
    .then((data) => {
      window.dataset = data;
      currentSet = window.dataset;
    });

  form.submit(doSearch);

  searchValue.addEventListener("input", doSearch);
});
