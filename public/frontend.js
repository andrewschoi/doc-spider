const uploadForm = document.getElementById("uploadForm");
const zipfileInput = document.getElementById("zipfileInput");
const responseContainer = document.getElementById("responseContainer");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append("zipfile", zipfileInput.files[0]);

  try {
    const response = await fetch("http://localhost:8080/upload", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (response.ok) {
      const data = await response.json();
      // Create a variable to hold all parsed markdown
      let htmlContent = "";
      data.forEach((item) => {
        // Append each HTML item to htmlContent
        htmlContent += item;
      });
      // Assign the parsed markdown to the innerHTML of the response container
      responseContainer.innerHTML = htmlContent;
    } else {
      responseContainer.innerText = "Error uploading file";
    }
  } catch (error) {
    console.error("Error:", error);
    responseContainer.innerText = "An error occurred";
  }
});
