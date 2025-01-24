document.addEventListener("DOMContentLoaded", () => {
    fetchStartups();
});

function fetchStartups() {
    fetch("http://localhost:5000/startups")
        .then((response) => response.json())
        .then((data) => {
            displayStartups(data);
            setupSearch(data);
        })
        .catch((error) => console.error("Error fetching startups:", error));
}

function displayStartups(startups) {
    const startupsContainer = document.getElementById("startups");
    startupsContainer.innerHTML = "";

    startups.forEach((startup) => {
        const card = document.createElement("div");
        card.classList.add("startup-card");

        card.innerHTML = `
            <img src="/uploads/logos/${startup.logo || 'default-logo.png'}" alt="${startup.name}" class="startup-logo">
            <h2>${startup.name}</h2>
            <p>${startup.pitch}</p>
            <div>${generateSectorTags(startup.sector)}</div>
            <button class="btn more-info-btn" data-id="${startup.id}">More Info</button>
        `;

        startupsContainer.appendChild(card);
    });

    document.querySelectorAll(".more-info-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            showMoreInfo(id);
        });
    });
}

function generateSectorTags(sectors) {
    if (!sectors) return "";
    return sectors.split(",").map((sector) => `<span class="sector-tag">${sector.trim()}</span>`).join("");
}

function showMoreInfo(id) {
    fetch(`http://localhost:5000/startups/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Startup not found (ID: ${id})`);
            }
            return response.json();
        })
        .then((startup) => {
            const modalOverlay = document.getElementById("modal-overlay");
            const modalHeader = document.getElementById("modal-header");
            const modalBody = document.getElementById("modal-body");

            modalHeader.textContent = startup.name;
            modalBody.innerHTML = `
                <img src="/uploads/logos/${startup.logo || 'default-logo.png'}" alt="${startup.name}" class="startup-logo">
                <p>${startup.pitch}</p>
                <h3>Industries</h3>
                <div>${generateSectorTags(startup.sector)}</div>
                <h3>Contact</h3>
                <p>${startup.contact_firstname} ${startup.contact_lastname}</p>
                <h3>Pitch Deck</h3>
                <a href="/uploads/pitch_decks/${startup.pitch_deck}" target="_blank">View Pitch Deck</a>
            `;

            modalOverlay.style.display = "flex";
        })
        .catch((error) => {
            console.error("Error fetching startup details:", error.message);
            alert("Unable to fetch startup details. Please try again.");
        });
}


document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.remove("active");
});

function setupSearch(startups) {
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredStartups = startups.filter((startup) =>
            startup.name.toLowerCase().includes(searchTerm)
        );
        displayStartups(filteredStartups);
    });
}
