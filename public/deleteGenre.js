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
