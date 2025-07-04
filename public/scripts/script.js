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
  console.log("ADD: " + entityName + " " + fetchUrl);

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
  const deleteBanner = document.querySelector("#delete-banner")?.checked;
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
  const galleryInput = document.getElementById("gallery-images");
  const videos = document.getElementById("hidden-videos-input").value;

  const imagesWrapper = document.querySelector(".images-wrapper");
  const dataImagesToDelete = imagesWrapper.getAttribute(
    "data-images-to-delete"
  );
  const imagesToDelete = dataImagesToDelete
    ? JSON.parse(dataImagesToDelete)
    : [];

  console.log("IMAGES TO DELETE: " + imagesToDelete);

  const formData = new FormData();

  if (coverInput.files.length) {
    formData.append("cover", coverInput.files[0]);
  }

  if (bannerInput.files.length) {
    formData.append("banner", bannerInput.files[0]);
  }

  if (galleryInput.files.length) {
    for (const file of galleryInput.files) {
      formData.append("gallery-images", file);
    }
  }

  if (imagesToDelete.length) {
    formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
  }

  formData.append("title", title);
  formData.append("deleteBanner", deleteBanner);
  formData.append("release", releaseDate);
  formData.append("description", description);
  formData.append("videos", videos);
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
        window.location.href = `/games/${id}`;
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
    formData.append(`${entity}-image`, fileInput.files[0]);
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

const passwordInput = document.querySelector(".delete-modal #password");
if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const passwordWarning = document.querySelector(".password-warning");
    if (!passwordWarning.classList.contains("hidden")) {
      passwordWarning.classList.add("hidden");
    }

    const wrongPasswordWarning = document.querySelector(
      ".wrong-password-warning"
    );
    if (!wrongPasswordWarning.classList.contains("hidden")) {
      wrongPasswordWarning.classList.add("hidden");
    }
  });
}

function deleteEntity() {
  const deleteModal = document.querySelector(".delete-modal");
  const data = JSON.parse(deleteModal.getAttribute("data-delete"));

  const { id, fetchUrl, redirect } = data;

  const passwordInput = deleteModal.querySelector("#password");
  const password = passwordInput.value;

  if (!password) {
    const passwordWarning = document.querySelector(".password-warning");
    if (passwordWarning.classList.contains("hidden")) {
      passwordWarning.classList.remove("hidden");
    }
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
        if (redirect === "reload") {
          window.location.reload();
        } else {
          window.location.href = redirect;
        }
      } else if (response.status === 401) {
        const wrongPasswordWarning = document.querySelector(
          ".wrong-password-warning"
        );
        if (wrongPasswordWarning.classList.contains("hidden")) {
          wrongPasswordWarning.classList.remove("hidden");
        }
      }
    })
    .catch((error) => console.error("Error:", error));
}

const showDeleteModal = (entity, id, fetchUrl, redirect) => {
  const passwordInput = document.querySelector(".delete-modal #password");
  passwordInput.value = "";
  const showPasswordButton = document.querySelector(".password-button.show");
  const hidePasswordButton = document.querySelector(".password-button.hide");

  if (showPasswordButton.classList.contains("hidden")) {
    showPasswordButton.classList.remove("hidden");
  }
  if (!hidePasswordButton.classList.contains("hidden")) {
    hidePasswordButton.classList.add("hidden");
  }

  const modalBackdrop = document.querySelector(".modal-backdrop");
  modalBackdrop.classList.remove("hidden");

  const modalText = document.querySelector(".modal-text");
  modalText.innerText = `Are you sure you want to delete this ${entity} ${
    entity != "game" ? "and all related games" : ""
  }?`;

  const deleteModal = document.querySelector(".delete-modal");
  deleteModal.setAttribute(
    "data-delete",
    JSON.stringify({ id, fetchUrl, redirect })
  );
};

const closeDeleteModal = () => {
  const modalBackdrop = document.querySelector(".modal-backdrop");
  if (!modalBackdrop.classList.contains("hidden"))
    modalBackdrop.classList.add("hidden");
};

const togglePassword = () => {
  const passwordInput = document.querySelector(".delete-modal #password");
  passwordInput.type = passwordInput.type == "text" ? "password" : "text";

  document.querySelector(".password-button.show").classList.toggle("hidden");
  document.querySelector(".password-button.hide").classList.toggle("hidden");
};

const imageInputs = document.querySelectorAll(
  ".banner-image, .cover-image, .logo-image"
);
imageInputs.forEach((input) => {
  const imageType = input.getAttribute("data-type");
  const previewWrapper = document.querySelector(
    `.${imageType}-preview-wrapper`
  );

  const renderImage = (file) => {
    previewWrapper.innerHTML = "";
    const initialImage = document.querySelector(
      `.${imageType}-preview.initial`
    );
    if (initialImage) initialImage.remove();

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageWrapper = document.createElement("section");
      imageWrapper.classList.add("image-wrapper");

      const removeButton = document.createElement("img");
      removeButton.classList.add("remove-button");
      removeButton.src = "/assets/images/icons/x-mark.svg";
      removeButton.title = "Remove";
      imageWrapper.appendChild(removeButton);
      removeButton.addEventListener("click", () => {
        previewWrapper.innerHTML = "";
        input.files = new DataTransfer().files;
      });

      const image = document.createElement("img");
      image.alt = `${imageType} image`;
      image.src = e.target.result;
      imageWrapper.appendChild(image);

      previewWrapper.appendChild(imageWrapper);
    };
    reader.readAsDataURL(file);
  };

  input.addEventListener("change", (event) => {
    renderImage(input.files[0]);
  });

  // If navigating back or forward, clear the UI if no files are present
  window.addEventListener("pageshow", () => {
    const file = input.files[0];
    if (file) {
      renderImage(file);
    } else {
      const initialImage = document.querySelector(
        `.${imageType}-preview.initial`
      );
      if (initialImage) return;

      previewWrapper.innerHTML = "";
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

  search = search.trim();

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

// Prevent multiple form submissions
document.body.addEventListener("submit", function (event) {
  const form = event.target;

  if (form.dataset.submitted) {
    event.preventDefault();
    return false;
  }

  form.dataset.submitted = true;
});

const galleryImagesInput = document.getElementById("gallery-images");

if (galleryImagesInput) {
  const imagesWrapper = document.querySelector(".images-wrapper");
  let dt = new DataTransfer(); // Stores selected files

  const renderImages = () => {
    Array.from(imagesWrapper.children).forEach((childElement) => {
      if (!childElement.classList.contains("not-in-input")) {
        childElement.remove();
      }
    });

    for (const file of dt.files) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageWrapper = document.createElement("section");
        imageWrapper.classList.add("image-wrapper");

        const removeButton = document.createElement("img");
        removeButton.classList.add("remove-button");
        removeButton.src = "/assets/images/icons/x-mark.svg";
        removeButton.title = "Remove";
        imageWrapper.appendChild(removeButton);

        const image = document.createElement("img");
        image.alt = "Game image";
        image.src = e.target.result;
        imageWrapper.appendChild(image);
        imagesWrapper.append(imageWrapper);

        removeButton.addEventListener("click", () => {
          imageWrapper.remove();

          for (let i = 0; i < dt.items.length; i++) {
            if (
              dt.files[i].name === file.name &&
              dt.files[i].size === file.size
            ) {
              dt.items.remove(i);
              break;
            }
          }

          galleryImagesInput.files = dt.files;

          if (galleryImagesInput.files.length <= 8) {
            const galleryWarning = document.querySelector(
              ".gallery-max-warning"
            );
            galleryWarning.classList.add("hidden");

            const submitButton = document.querySelector(
              "button[form='add-game']",
              "button[form='update-game']"
            );
            submitButton.disabled = false;
          }
        });
      };

      reader.readAsDataURL(file);
    }

    galleryImagesInput.files = dt.files;
  };

  galleryImagesInput.addEventListener("change", () => {
    const newFiles = Array.from(galleryImagesInput.files);
    for (const file of newFiles) {
      let exists = false;
      for (const existingFile of dt.files) {
        if (
          existingFile.name === file.name &&
          existingFile.size === file.size
        ) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        dt.items.add(file);
      }
    }
    renderImages();
  });

  // If navigating back or forward, clear the UI if no files are present
  window.addEventListener("pageshow", () => {
    if (galleryImagesInput.files.length > 0) {
      console.log("RENDER");

      dt = new DataTransfer();

      const newFiles = Array.from(galleryImagesInput.files);
      for (const file of newFiles) {
        dt.items.add(file);
      }

      galleryImagesInput.files = dt.files;
      imagesWrapper.innerHTML = "";

      renderImages();
    } else {
      Array.from(imagesWrapper.children).forEach((childElement) => {
        if (!childElement.classList.contains("not-in-input")) {
          childElement.remove();
        }
      });
    }
  });

  galleryImagesInput.addEventListener("change", () => {
    if (galleryImagesInput.files.length > 8) {
      const galleryWarning = document.querySelector(".gallery-max-warning");
      galleryWarning.classList.remove("hidden");

      const submitButton = document.querySelector(
        "button[form='add-game'], button[form='update-game']"
      );
      submitButton.disabled = true;
    }
  });
}

const deleteBannerCheckbox = document.getElementById("delete-banner");

if (deleteBannerCheckbox) {
  const bannerPreview = document.querySelector(".banner-preview");
  const previewWrapper = document.querySelector(".banner-preview-wrapper");
  deleteBannerCheckbox.addEventListener("change", () => {
    const displayStyle = deleteBannerCheckbox.checked ? "none" : "block";
    bannerPreview.style.display = displayStyle;
    previewWrapper.style.display = displayStyle;
  });
}

const removeImageNotInInput = (imgUrl) => {
  document.querySelector(`.image-wrapper[data-image='${imgUrl}']`).remove();

  const imagesWrapper = document.querySelector(".images-wrapper");

  const dataImagesToDelete = imagesWrapper.getAttribute(
    "data-images-to-delete"
  );

  const imagesToDelete = dataImagesToDelete
    ? JSON.parse(dataImagesToDelete)
    : [];
  imagesToDelete.push(imgUrl);

  imagesWrapper.setAttribute(
    "data-images-to-delete",
    JSON.stringify(imagesToDelete)
  );
};

const validateVideoURLGetEmbed = (url) => {
  if (!url) return false;

  const regExpYouTubeURL =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  const match = url.match(regExpYouTubeURL);
  if (match && match[2].length == 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0`;
  }

  return false;
};

const renderVideo = (embedURL, noAddition) => {
  const videosWrapper = document.querySelector(".videos-wrapper");

  const videoWrapper = document.createElement("section");
  videoWrapper.classList.add("video-wrapper");

  const removeButton = document.createElement("img");
  removeButton.classList.add("remove-button");
  removeButton.src = "/assets/images/icons/x-mark.svg";
  removeButton.title = "Remove";
  videoWrapper.appendChild(removeButton);

  const iframe = document.createElement("iframe");
  iframe.id = embedURL;
  iframe.type = "text/html";
  iframe.width = "400";
  iframe.height = "225";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.src = embedURL;
  videoWrapper.append(iframe);
  removeButton.addEventListener("click", () => {
    const previousVideoUrls = JSON.parse(hiddenVideosInput.value);
    const index = previousVideoUrls.findIndex((url) => url == embedURL);

    const updatedVideoUrls = previousVideoUrls;
    updatedVideoUrls.splice(index, 1);
    hiddenVideosInput.value = JSON.stringify(updatedVideoUrls);
    videoWrapper.remove();

    const errorMessage = document.querySelector(".error[data-path='videos']");
    if (errorMessage) errorMessage.remove();

    if (updatedVideoUrls.length < 3) {
      galleryVideosInput.disabled = false;
      addVideoButton.disabled = false;
    }
  });
  videosWrapper.append(videoWrapper);

  const hiddenVideosInput = document.getElementById("hidden-videos-input");

  const previousVideoUrls = JSON.parse(hiddenVideosInput.value);

  if (noAddition) {
    if (previousVideoUrls.length == 3) {
      galleryVideosInput.disabled = true;
      document.querySelector("button.add-video").disabled = true;
    }
    return;
  }

  const updatedVideoUrls = [...previousVideoUrls, embedURL];
  hiddenVideosInput.value = JSON.stringify(updatedVideoUrls);
  galleryVideosInput.value = "";

  if (updatedVideoUrls.length == 3) {
    galleryVideosInput.disabled = true;
    document.querySelector("button.add-video").disabled = true;
  }
};

const galleryVideosInput = document.getElementById("gallery-videos");
if (galleryVideosInput) {
  galleryVideosInput.addEventListener("input", () => {
    const warning = document.querySelector(".gallery-video-warning");
    warning.classList.add("hidden");
  });

  const addVideoButton = document.querySelector("button.add-video");
  addVideoButton.addEventListener("click", () => {
    const videoUrl = galleryVideosInput.value;
    if (!videoUrl) return;

    const embedURL = validateVideoURLGetEmbed(videoUrl);
    if (embedURL) {
      renderVideo(embedURL);
    } else {
      const warning = document.querySelector(".gallery-video-warning");
      warning.classList.remove("hidden");
    }
  });

  window.addEventListener("pageshow", () => {
    const hiddenVideosInput = document.getElementById("hidden-videos-input");
    console.log(hiddenVideosInput.value);

    const videoUrls = JSON.parse(hiddenVideosInput.value);
    if (videoUrls.length > 0) {
      console.log("RENDER VIDEO");
      const videosWrapper = document.querySelector(".videos-wrapper");
      videosWrapper.innerHTML = "";

      videoUrls.forEach((url) => {
        const embedURL = validateVideoURLGetEmbed(url);
        if (embedURL) renderVideo(embedURL, true);
      });
    }
  });
}

const removeWarning = (errorPath) => {
  const error = document.querySelector(`.error[data-path=${errorPath}]`);
  if (error) error.remove();
};

const sortBySelect = document.getElementById("sort-by");
if (sortBySelect) {
  sortBySelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set("sort", value);

    window.location.search = params.toString();
  });
}

const hideAllOptionSections = () => {
  document
    .querySelectorAll("section.options")
    .forEach(
      (section) =>
        !section.classList.contains("hidden") && section.classList.add("hidden")
    );
};

const toggleOptionsSection = (genreId) => {
  const optionsSection = document.getElementById(`genre-${genreId}`);
  const optionWasHidden = optionsSection.classList.contains("hidden");

  hideAllOptionSections();

  if (optionWasHidden) optionsSection.classList.remove("hidden");
};

const toggleSidebar = () => {
  const sidebar = document.querySelector(".outer-container aside");
  sidebar.classList.toggle("expanded");
  document.body.classList.toggle("expanded-sidebar");
};

const showSelected = (event, url, isVideo) => {
  const container = document.querySelector(".selected-image-container");
  if (!container) return;

  if (event) {
    const previousSelection = document.querySelector(
      ".gallery-preview.selected"
    );
    if (previousSelection) previousSelection.classList.remove("selected");
    event.target.classList.add("selected");
  }

  container.innerHTML = "";

  if (isVideo) {
    const iframe = document.createElement("iframe");
    iframe.id = url;
    iframe.type = "text/html";
    iframe.width = "400";
    iframe.height = "225";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.src = url;

    container.appendChild(iframe);
    return;
  }

  const image = document.createElement("img");
  image.src = url;
  container.appendChild(image);
};
