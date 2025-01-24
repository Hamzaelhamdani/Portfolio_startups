document.addEventListener("DOMContentLoaded", () => {
    fetchStartups();
});

// Fetch startups from the JSON file
function fetchStartups() {
    fetch("./startups.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const startups = data.startups;
            displayStartups(startups); // Display all startups
            setupSearch(startups); // Initialize the search functionality
        })
        .catch((error) => {
            console.error("Error fetching startups:", error);
        });
}

function displayStartups(startups) {
    const startupsContainer = document.getElementById("startups");
    startupsContainer.innerHTML = ""; // Clear previous cards

    startups.forEach((startup) => {
        const card = document.createElement("div");
        card.classList.add("startup-card");

        card.innerHTML = `
            <img src="${startup.Logo}" alt="${startup["Startup Name"]}" class="startup-logo">
            <h2>${startup["Startup Name"]}</h2>
            <p>${startup["ONE LINE PITCH"]}</p>
            <div class="tags">
                <span class="sector-tag">${startup.Secteur}</span>
                <span class="catalogue-tag">${startup.Catalogue}</span>
            </div>
            <a href="https://${startup.Link}" target="_blank" class="btn">Visit</a>
        `;

        startupsContainer.appendChild(card);
    });
}


// Setup the search functionality
function setupSearch(startups) {
    const searchBar = document.getElementById("search-bar");

    searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // Filter startups based on the search term
        const filteredStartups = startups.filter((startup) => {
            return (
                startup["Startup Name"].toLowerCase().includes(searchTerm) ||
                (startup["ONE LINE PITCH"] &&
                    startup["ONE LINE PITCH"].toLowerCase().includes(searchTerm)) ||
                (startup.Secteur && startup.Secteur.toLowerCase().includes(searchTerm))||
                (startup.Catalogue && startup.Catalogue.toLowerCase().includes(searchTerm))
                
            );
        });

        displayStartups(filteredStartups); // Update the displayed startups
    });
}
