// Fetch startups and display them in the table
const fetchAndDisplayStartups = () => {
    fetch("http://localhost:5000/startups")
        .then((response) => response.json())
        .then((startups) => {
            const tableBody = document.querySelector("#manage-startups tbody");
            tableBody.innerHTML = ""; // Clear table before rendering
            startups.forEach((startup) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <img src="/uploads/logos/${startup.logo}" alt="Logo" width="50" onerror="this.onerror=null;this.src='/default-logo.png';">
                    </td>
                    <td>${startup.name}</td>
                    <td>${startup.sector}</td>
                    <td>
                        <button class="edit-btn" data-id="${startup.id}">Modifier</button>
                        <button class="delete-btn" data-id="${startup.id}">Supprimer</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => console.error("Erreur :", error));
};

// Handle delete and edit actions
document.querySelector("#manage-startups").addEventListener("click", (e) => {
    const target = e.target;

    // Delete a startup
    if (target.classList.contains("delete-btn")) {
        const id = target.getAttribute("data-id");
        if (confirm("Êtes-vous sûr de vouloir supprimer cette startup ?")) {
            fetch(`http://localhost:5000/delete-startup/${id}`, { method: "DELETE" })
                .then((response) => {
                    if (response.ok) {
                        target.closest("tr").remove();
                        alert("Startup supprimée avec succès.");
                    } else {
                        alert("Erreur lors de la suppression de la startup.");
                    }
                })
                .catch((error) => console.error("Erreur :", error));
        }
    }

    // Edit a startup (not implemented)
    if (target.classList.contains("edit-btn")) {
        const id = target.getAttribute("data-id");
        alert(`Édition non implémentée pour l'ID ${id}`);
    }
});

// Handle the form submission for adding startups
document.querySelector("#add-startup form").addEventListener("submit", (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Validate required fields
    if (!formData.get("name") || !formData.get("pitch") || !formData.get("sector")) {
        document.querySelector("#form-feedback").textContent = "Veuillez remplir tous les champs obligatoires.";
        document.querySelector("#form-feedback").style.color = "red";
        return;
    }

    fetch(form.action, {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (response.ok) {
                document.querySelector("#form-feedback").textContent = "Startup ajoutée avec succès !";
                document.querySelector("#form-feedback").style.color = "green";
                form.reset(); // Reset the form after successful submission
                fetchAndDisplayStartups(); // Refresh the table
            } else {
                document.querySelector("#form-feedback").textContent = "Erreur lors de l'ajout de la startup.";
                document.querySelector("#form-feedback").style.color = "red";
            }
        })
        .catch((error) => {
            console.error("Erreur :", error);
            document.querySelector("#form-feedback").textContent = "Erreur réseau.";
            document.querySelector("#form-feedback").style.color = "red";
        });
});

// Initial fetch to populate the table
document.addEventListener("DOMContentLoaded", fetchAndDisplayStartups);
