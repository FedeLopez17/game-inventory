const toggleForm = (formId) => {
  const form = document.querySelector(`.toggle-form#${formId}`);
  form.classList.toggle("show");
};

const validateAtLeastOneChecked = (name) => {
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][name="${name}"]`
  );

  // Force DOM refresh
  checkboxes.forEach((checkbox) => {
    checkbox.checked = checkbox.checked; // Re-assert DOM state
  });

  const atLeastOneChecked = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );

  checkboxes.forEach((checkbox) => (checkbox.required = !atLeastOneChecked));
};

const initializeCheckboxValidation = () => {
  ["platforms", "genre", "studio", "publisher"].forEach(
    validateAtLeastOneChecked
  );
};

// Use pageshow to ensure this runs even on back navigation
window.addEventListener("pageshow", initializeCheckboxValidation);

const addEntity = async (entityName, fetchUrl) => {
  const name = document.querySelector(`#${entityName}-name`).value;
  const description = document.querySelector(
    `#${entityName}-description`
  ).value;
  const fileInput = document.querySelector(`#${entityName}-image`);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append(`${entityName}-image`, fileInput.files[0]);
  formData.append("response", "JSON");

  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      body: formData,
    });

    const errorSpans = document.querySelectorAll(
      `.${entityName}-inputs span.error`
    );
    errorSpans.forEach((span) => span.remove());

    if (response.status === 201) {
      const entity = await response.json();

      const wrapper = document.querySelector(`.${entityName}-wrapper`);
      const label = document.createElement("label");
      label.innerText = entity.name;
      label.htmlFor = entityName + entity.id;

      const checkboxInput = document.createElement("input");
      checkboxInput.type = "checkbox";
      checkboxInput.name = entityName;
      checkboxInput.value = entity.id;
      checkboxInput.id = entityName + entity.id;
      checkboxInput.required = true;

      wrapper.appendChild(checkboxInput);
      wrapper.appendChild(label);

      document.querySelector(`form#add-${entityName}`).reset();
      toggleForm(`${entityName}-form`);
    } else if (response.status === 400) {
      const res = await response.json();
      if (res.errors.length) {
        res.errors.forEach((error) => {
          const errorSpan = document.createElement("span");
          errorSpan.classList.add("error");
          errorSpan.textContent = error.msg;

          // Multer and validation change the name, because regardless of the input name, it's sent as file in req.body
          const fieldName =
            error.path === "file" ? `${entityName}-image` : error.path;

          const input = document.querySelector(
            `.${entityName}-inputs [name="${fieldName}"]`
          );

          const { parentElement } = input;

          const previousError = parentElement.querySelector("span.error");
          if (previousError) previousError.remove();

          parentElement.appendChild(errorSpan);
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const getCheckedInputs = (name) => {
  const checkedCheckboxes = document.querySelectorAll(
    `input[name="${name}"]:checked`
  );

  const selectedValues = Array.from(checkedCheckboxes).map(
    (checkbox) => checkbox.value
  );

  return selectedValues;
};

function updateGame(id) {
  const password = prompt("Please enter your password to confirm update:");
  if (!password) {
    alert(`Password is required to update the game.`);
    return;
  }

  const title = document.querySelector("#title").value;
  const coverInput = document.querySelector("#cover-image");
  const bannerInput = document.querySelector("#banner-image");
  const releaseDate = document.querySelector("#release-date").value;
  const description = document.querySelector("#description").value;
  const website = document.querySelector("#website").value;
  const goty = document.querySelector("#goty").checked;
  const platforms = getCheckedInputs("platforms");
  const pegiRating = document.querySelector("[name='pegi']").value;
  const esrbRating = document.querySelector("[name='esrb']").value;
  const ign = document.querySelector("#ign").value;
  const opencritic = document.querySelector("#opencritic").value;
  const metacritic = document.querySelector("#metacritic").value;
  const genres = getCheckedInputs("genre");
  const studios = getCheckedInputs("studio");
  const publishers = getCheckedInputs("publisher");

  const formData = new FormData();

  if (coverInput.files.length > 0) {
    formData.append("cover", coverInput.files[0]);
  }

  if (bannerInput.files.length > 0) {
    formData.append("banner", bannerInput.files[0]);
  }

  formData.append("title", title);
  formData.append("release", releaseDate);
  formData.append("description", description);
  formData.append("website", website);
  formData.append("goty", goty);
  formData.append("platforms", platforms);
  formData.append("pegi", pegiRating);
  formData.append("esrb", esrbRating);
  formData.append("ign", ign);
  formData.append("opencritic", opencritic);
  formData.append("metacritic", metacritic);
  formData.append("genre", genres);
  formData.append("studio", studios);
  formData.append("publisher", publishers);
  formData.append("password", password);

  console.log(id);

  fetch(`/games/update/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then(async (response) => {
      if (response.ok) {
        window.location.href = "/games";
      } else if (response.status === 401) {
        alert("Wrong password");
      } else if (response.status === 400) {
        const { errors } = await response.json();
        displayErrors(errors);
      } else {
        console.error("Failed to update game");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function displayErrors(errors) {
  console.log(errors);

  errors.forEach((error) => {
    const errorElement = document.querySelector(
      `.error[data-path='${error.path}']`
    );
    console.log(error.path);
    errorElement.textContent = error.msg;
  });
}

function updateEntity(entity, id, fetchUrl, redirect) {
  const password = prompt("Please enter your password to confirm update:");
  if (!password) {
    alert(`Password is required to update the ${entity}.`);
    return;
  }

  const name = document.querySelector(`#${entity}-name`).value;
  const description = document.querySelector(`#${entity}-description`).value;
  const fileInput = document.querySelector(`#${entity}-image`);
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("password", password);

  if (fileInput.files.length > 0) {
    formData.append(`#${entity}-image`, fileInput.files[0]);
  }

  fetch(`${fetchUrl}/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = redirect;
      } else if (response.status === 401) {
        alert("Wrong password");
      } else {
        console.error(`Failed to update ${entity}`);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function deleteEntity(entity, id, fetchUrl, redirect) {
  const confirmDelete = confirm(
    `Are you sure you want to delete this ${entity}?`
  );
  if (!confirmDelete) return;

  const password = prompt("Please enter your password to confirm deletion:");
  if (!password) {
    alert(`Password is required to delete the ${entity}.`);
    return;
  }

  fetch(`${fetchUrl}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })
    .then((response) => {
      if (response.status === 204) {
        window.location.href = redirect;
      } else if (response.status === 401) {
        alert("Wrong password");
      }
    })
    .catch((error) => console.error("Error:", error));
}

["cover", "banner", "logo"].forEach((imageType) => {
  const input = document.getElementById(`${imageType}-image`);
  if (!input) return;

  input.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById(`${imageType}-preview`).src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});

const searchbar = document.querySelector("#searchbar input");
const searchDomain = document.querySelector("#searchbar select");
const searchResultElement = document.querySelector("#search-results");
const searchBackdrop = document.querySelector(".search-backdrop");
let searchTimeout;

if (searchBackdrop && searchResultElement) {
  searchBackdrop.addEventListener("click", () => {
    searchResultElement.classList.remove("active");
  });
}

if (searchbar && searchResultElement) {
  searchbar.addEventListener("click", () => {
    if (!document.querySelector(".result-item")) return;

    searchResultElement.classList.add("active");
  });
}

if (searchDomain) {
  searchDomain.addEventListener("change", () => {
    if (!searchbar.value) return;
    search(searchbar.value, searchDomain.value);
  });
}

if (searchbar) {
  searchbar.addEventListener("keydown", async (e) => {
    if (e.key != "Enter" || !searchbar.value) return;

    let entityId;
    let domain = searchDomain.value;
    let domainToSearchIn;
    console.log(domain);

    if (domain == "specific-entity") {
      domain = "games";
      domainToSearchIn = searchDomain.getAttribute("data-entity");
      entityId = searchDomain.getAttribute("data-entity-id");
    }

    redirectToSearchResults(
      domain,
      searchbar.value,
      entityId,
      domainToSearchIn
    );
  });

  searchbar.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    clearSearchResults();

    if (!searchbar.value) return;

    searchTimeout = setTimeout(() => {
      search(searchbar.value, searchDomain.value);
    }, 250);
  });
}

const clearSearchResults = () => {
  searchResultElement.innerHTML = "";
  searchResultElement.classList.remove("active");
};

const search = async (search, domain) => {
  clearSearchResults();

  if (domain === "all") {
    const data = { games: [], publishers: [], studios: [] };
    const domains = ["games", "publishers", "studios"];

    const promises = domains.map(async (domain) => {
      data[domain] = await fetchSearchResults(domain, search);
      const { total } = await fetchTotal(domain, search);
      data[domain].total = total;
    });

    await Promise.all(promises);

    searchResultElement.classList.add("active");

    if (!data.games.length && !data.studios.length && !data.publishers.length) {
      displayNoResultsMessage();
      return;
    }

    domains.forEach((domain) => {
      if (!data[domain].length) return;

      const titleWrapper = document.createElement("section");
      titleWrapper.classList.add("tittle-wrapper");

      const title = document.createElement("h3");
      title.classList.add("entity-title");
      title.innerText = capitalize(domain);
      titleWrapper.appendChild(title);

      if (data[domain].total > 3) {
        const anchor = document.createElement("a");
        const params = new URLSearchParams({
          domain,
          search,
        });
        anchor.href = `/${domain}/search?${params.toString()}`;
        anchor.innerText = `See all - (${data[domain].total})`;
        titleWrapper.appendChild(anchor);
      }

      searchResultElement.appendChild(titleWrapper);

      data[domain].forEach((item) => {
        populateSearchResults(item, domain);
      });
    });

    return;
  }

  let searchResult;
  let total;
  let entityId;
  let domainToSearchIn;

  if (domain === "specific-entity") {
    domain = searchDomain.getAttribute("data-entity");
    entityId = searchDomain.getAttribute("data-entity-id");

    searchResult = await fetchGamesByEntity(domain, search, entityId);
    total = (await fetchGamesTotalByEntity(domain, search, entityId)).total;

    domainToSearchIn = domain;
    domain = "games";
  } else {
    searchResult = await fetchSearchResults(domain, search);
    total = (await fetchTotal(domain, search)).total;
  }

  searchResultElement.classList.add("active");

  if (!searchResult.length) {
    displayNoResultsMessage();
    return;
  }

  searchResult.forEach((item) => {
    populateSearchResults(item, domain);
  });

  if (total > 3) {
    const anchor = document.createElement("a");
    const params = new URLSearchParams({
      domain,
      search,
      ...(entityId && { entityId }),
      ...(domainToSearchIn && { domainToSearchIn }),
    });

    anchor.href = `/${domain}/search?${params.toString()}`;

    anchor.innerText = `See all - (${total})`;
    searchResultElement.appendChild(anchor);
  }
};

const populateSearchResults = (item, domain) => {
  const wrapperAnchor = document.createElement("a");
  wrapperAnchor.href = `/${domain}/${item.videogame_id || item.id}`;

  const resultItem = document.createElement("section");
  resultItem.classList.add("result-item");

  const resultImage = document.createElement("img");
  resultImage.src = item.cover_image_url || item.logo_image_url;
  resultImage.alt = item.title || item.name;

  const title = document.createElement("p");
  title.classList.add("title");
  title.innerText = item.title || item.name;

  wrapperAnchor.appendChild(resultItem);
  resultItem.appendChild(resultImage);
  resultItem.appendChild(title);
  searchResultElement.appendChild(wrapperAnchor);
};

const displayNoResultsMessage = () => {
  const resultItem = document.createElement("section");
  resultItem.classList.add("result-item");
  const message = document.createElement("p");
  message.classList.add("title");
  message.innerText = "Nothing found";
  resultItem.appendChild(message);
  searchResultElement.appendChild(resultItem);
};

const fetchSearchResults = async (domain, search) => {
  try {
    const res = await fetch(`/${domain}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch results for ${domain}`);
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const redirectToSearchResults = (
  domain,
  search,
  entityId,
  domainToSearchIn
) => {
  try {
    const params = new URLSearchParams({
      domain,
      search,
      ...(entityId && { entityId }),
      ...(domainToSearchIn && { domainToSearchIn }),
    });

    window.location.href = `/${domain}/search?${params.toString()}`;
  } catch (error) {
    console.error(error);
  }
};

const fetchTotal = async (domain, search) => {
  try {
    const res = await fetch(`/${domain}/search/total`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch results");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchGamesTotalByEntity = async (domain, search, entityId) => {
  try {
    const res = await fetch("/games/search/total", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search, domain, entityId }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch results");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchGamesByEntity = async (domain, search, entityId) => {
  try {
    const res = await fetch("/games/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search, domain, entityId }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch results");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
