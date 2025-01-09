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
