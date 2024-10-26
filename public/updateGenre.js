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
