function deleteGenre(id) {
  const confirmDelete = confirm("Are you sure you want to delete this genre?");
  if (!confirmDelete) return;

  const password = prompt("Please enter your password to confirm deletion:");
  if (!password) {
    alert("Password is required to delete the genre.");
    return;
  }

  fetch(`/genres/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })
    .then((response) => {
      if (response.status === 204) {
        window.location.href = "/genres";
      } else if (response.status === 401) {
        alert("Wrong password");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function updateGenre(id) {
  const password = prompt("Please enter your password to confirm update:");
  if (!password) {
    alert("Password is required to update the genre.");
    return;
  }

  const name = document.querySelector("#genre-name").value;
  const description = document.querySelector("#genre-description").value;
  const fileInput = document.querySelector("#image");
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("password", password);

  if (fileInput.files.length > 0) {
    formData.append("genre-image", fileInput.files[0]);
  }

  fetch(`/genres/update/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/genres";
      } else if (response.status === 401) {
        alert("Wrong password");
      } else {
        console.error("Failed to update genre");
      }
    })
    .catch((error) => console.error("Error:", error));
}

const toggleForm = () => {
  const form = document.querySelector(".toggle-form");
  form.classList.toggle("show");
};

const addGenre = async () => {
  const name = document.querySelector("#genre-name").value;
  const description = document.querySelector("#genre-description").value;
  const fileInput = document.querySelector("#image");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("genre-image", fileInput.files[0]);
  formData.append("response", "JSON");

  try {
    const response = await fetch(`/genres/add`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const genre = await response.json();

      const genresWrapper = document.querySelector(".genres");
      const label = document.createElement("label");
      label.innerText = genre.name;

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = "genre";
      radioInput.value = genre.id;
      radioInput.required = true;

      label.appendChild(radioInput);
      genresWrapper.appendChild(label);
    } else {
      console.log("Couldn't add genre");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
