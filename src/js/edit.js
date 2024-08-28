"use strict";

let overlay, resultDiv, confirmation, updateForm, addForm, token; // globala variabler 


document.addEventListener('DOMContentLoaded', () => { // säkerställer att koden körs
    const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); logOut();
    });

    // tilldela variabler
    overlay = document.getElementById("overlay");
    resultDiv = document.getElementById("show--dishes");
    confirmation = document.getElementById("confirmation");
    updateForm = document.getElementById("update-form");
    addForm = document.getElementById("add-form");
    token = localStorage.getItem("token");

    // händelsehanterare
    document.getElementById("add-to-btn").addEventListener('click', () => { showOverlay('add') });
    document.getElementById("add-btn").addEventListener('click', (e) => { e.preventDefault(); addData(); });
    document.getElementById("cancel-btn").addEventListener('click', () => { closeOverlay() });
    document.getElementById("back-btn").addEventListener('click', () => { closeOverlay() });

    overlay.addEventListener('click', function (event) { // stäng overlay om man klickar utanför formulär
        if (event.target === overlay) {  // kontrollerar om klicket var på själva overlayen och inte på formuläret
            closeOverlay();
        }
    });

    const toggleButton = document.getElementById('toggle-header');
    const header = document.getElementById('header-fixed');

    toggleButton.addEventListener('click', function () {
        header.classList.toggle('nav-open');
    });

    displayData(); // anropar för att visa initial data
});

async function fetchData() { // hämta data
    const url = "https://pastaplace.onrender.com/dishes";

    try {
        const response = await fetch(url);
        if (!response.ok) { // felhantering
            throw new Error("Could not connect to API" + response.statusText);
        }
        const data = await response.json();
        return data; // returnerar svar från api
    } catch (error) {
        console.error("Could not fetch data", error);
        throw error;
    }
};

async function displayData() { // visa data
    const loadingIndicator = document.getElementById("loading-indicator");  // hämta och visa laddning
    loadingIndicator.style.display = 'flex';
    resultDiv.innerHTML = ""; // rensa befintligt innehåll

    try {
        const data = await fetchData();
        data.result.forEach(item => createDishElement(item)); // loopen körs genom funktionen som skapar varje item
    } catch (error) {
        console.error("Fault accured:", error);
    } finally {
        loadingIndicator.style.display = "none"; // Dölj laddningsindikatorn
    }
};

function createDishElement(item) { // skapa element för rätter
    const dishDiv = document.createElement("div");
    dishDiv.classList.add("result-dish");

    dishDiv.innerHTML = `
    <h1>${item.name}</h1>
    <p><strong>Beskrivning: </strong>${item.description}</p>
    <p><strong>Ingredienser: </strong>${item.ingredients}</p>
    <p><strong>Typ av rätt: </strong>${item.category}</p>
    <p><strong>Innehåller: </strong>${item.contains}</p>
    <p><strong>Pris: </strong>${item.currency}</p>`;

    const btnDiv = createButtonDiv(item); // skapar alla knappar för sig
    dishDiv.appendChild(btnDiv);
    resultDiv.appendChild(dishDiv);
};

function createButtonDiv(item) { // skapa div för knappar
    const btnDiv = document.createElement("div");
    btnDiv.classList.add("edit-div");

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    const editIcon = document.createElement("span");
    editIcon.classList.add("material-symbols-outlined");
    editIcon.textContent = "edit";
    editBtn.appendChild(editIcon);

    editBtn.dataset.dishID = item._id;
    editBtn.addEventListener('click', () => updateData(item));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    const deleteIcon = document.createElement("span");
    deleteIcon.classList.add("material-symbols-outlined");
    deleteIcon.textContent = "delete";
    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('click', () => confirmDeletion(item._id));

    btnDiv.appendChild(editBtn);
    btnDiv.appendChild(deleteBtn);

    return btnDiv;
};

async function addData() { // addera data

    // hämtar värde från inmatning
    const name = document.getElementById("name-add").value;
    const description = document.getElementById("description-add").value;
    const category = document.getElementById("category-add").value;
    const contains = document.getElementById("contains-add").value;
    const ingredients = document.getElementById("ingredients-add").value;
    const price = document.getElementById("price-add").value;

    // Rensa eventuella felmeddelanden
    document.getElementById("name-add-error").textContent = "";
    document.getElementById("description-add-error").textContent = "";
    document.getElementById("category-add-error").textContent = "";
    document.getElementById("contains-add-error").textContent = "";
    document.getElementById("ingredients-add-error").textContent = "";
    document.getElementById("price-add-error").textContent = "";

    // skapar nytt objekt
    const newDish = {
        name: name,
        description: description,
        category: category,
        contains: contains,
        ingredients: ingredients,
        price: price
    };

    const url = "https://pastaplace.onrender.com/dishes";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // token för behörighet
            },
            body: JSON.stringify(newDish)
        });

        const data = await response.json();

        if (!response.ok) {
            postValidation(data.errors);
            throw new Error("Failed to add data");
        }

        // Återställ formulärfält
        document.getElementById("name-add").value = "";
        document.getElementById("description-add").value = "";
        document.getElementById("category-add").value = "";
        document.getElementById("contains-add").value = "";
        document.getElementById("ingredients-add").value = "";
        document.getElementById("price-add").value = "";

        overlay.style.display = 'none';
        confirmationMessage("Din rätt är tillagd!");
        displayData();

    } catch (error) {
        console.error("Error when adding data", error);
    }
};

async function updateData(item) {
    // fyller i formuläret med info från maträtt
    document.getElementById("name").value = item.name;
    document.getElementById("description").value = item.description;
    document.getElementById("ingredients").value = item.ingredients;
    document.getElementById("category").value = item.category;
    document.getElementById("contains").value = item.contains;
    document.getElementById("price").value = item.price;

    // visa overlay för att uppdatera maträtten
    showOverlay('update');

    // hantera formulärets inskickning
    updateForm.onsubmit = async (e) => {
        e.preventDefault();

        // hämta uppdaterade värden från formuläret
        const updatedName = document.getElementById("name").value;
        const updatedDescription = document.getElementById("description").value;
        const updatedIngredients = document.getElementById("ingredients").value;
        const updatedCategory = document.getElementById("category").value;
        const updatedContains = document.getElementById("contains").value;
        const updatedPrice = document.getElementById("price").value;

        // skapar ett objekt med de uppdaterade värdena från formuläret
        const updatedDish = {
            name: updatedName,
            description: updatedDescription,
            ingredients: updatedIngredients,
            category: updatedCategory,
            contains: updatedContains,
            price: updatedPrice
        };

        try {
            const response = await fetch(`https://pastaplace.onrender.com/dishes/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedDish)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server response:", errorData);
                putValidation(errorData.errors);
                throw new Error("Failed to update data");
            }

            document.getElementById("name-put-error").textContent = "";
            document.getElementById("description-put-error").textContent = "";
            document.getElementById("ingredients-put-error").textContent = "";
            document.getElementById("category-put-error").textContent = "";
            document.getElementById("contains-put-error").textContent = "";
            document.getElementById("price-put-error").textContent = "";

            overlay.style.display = 'none';
            confirmationMessage("Maträtten är uppdaterad!");
            displayData(); // uppdatera sidan

        } catch (error) {
            console.error("Error while updating", error);
        }
    };
}

async function showConfirmation(message) { // visa bekräftelse
    showOverlay('confirmation');

    return new Promise((resolve, reject) => { // skapar promise
        const showConfirmation = document.createElement("div");
        showConfirmation.classList.add("show-confirmation");

        showConfirmation.innerHTML = `
        <div id="warning-message">
        <span id="warning" class="material-symbols-outlined">error</span>
        <div>${message}</div>
        </div>
        <div class="update-btns">
        <button id="yes" class="material-symbols-outlined">check_circle</button>
        <button id="no" type="button" class="material-symbols-outlined">cancel</button>
        </div>`;

        confirmation.appendChild(showConfirmation);

        const yesBtn = confirmation.querySelector("#yes");
        const noBtn = confirmation.querySelector("#no");

        yesBtn.addEventListener('click', () => {
            confirmation.innerHTML = "";
            overlay.style.display = 'none';

            resolve(true); // kallar på funktion då åtgärd bekräftades
        });

        noBtn.addEventListener('click', () => {
            confirmation.innerHTML = "";
            overlay.style.display = 'none';

            resolve(false); // kallar på funktion då åtgärd nekades
        });
    });
};

function confirmationMessage(message) { // bekräftelsemeddelanden
    const confirmation = document.querySelector(".banner--third");
    confirmation.style.display = 'flex';

    confirmation.innerHTML = `<p>${message}`;
};

async function confirmDeletion(id) { // bekräfta radera
    try {
        const confirmed = await showConfirmation("Är du säker på att du vill radera denna rätten?");
        if (confirmed) {
            await deleteData(id);
            displayData();
        }
    } catch (error) {
        console.error("Error occurred during deletion:", error);
    }
};

async function deleteData(id) { // radera data
    const url = `https://pastaplace.onrender.com/dishes/${id}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete data");
    }

    confirmationMessage("Din rätt är raderad!");
};

function postValidation(errors) { // hantera felmeddelanden
    if (errors) {
        if (errors.name) {
            document.getElementById("name-add-error").textContent = errors.name;
        }
        if (errors.description) {
            document.getElementById("description-add-error").textContent = errors.description;
        }
        if (errors.category) {
            document.getElementById("category-add-error").textContent = errors.category;
        }
        if (errors.contains) {
            document.getElementById("contains-add-error").textContent = errors.contains;
        }
        if (errors.ingredients) {
            document.getElementById("ingredients-add-error").textContent = errors.ingredients;
        }
        if (errors.price) {
            document.getElementById("price-add-error").textContent = errors.price;
        }
    }
};

function putValidation(errors) { // hantera felmeddelanden
    if (errors) {
        if (errors.name) {
            document.getElementById("name-put-error").textContent = errors.name;
        }
        if (errors.description) {
            document.getElementById("description-put-error").textContent = errors.description;
        }
        if (errors.category) {
            document.getElementById("category-put-error").textContent = errors.category;
        }
        if (errors.contains) {
            document.getElementById("contains-put-error").textContent = errors.contains;
        }
        if (errors.ingredients) {
            document.getElementById("ingredients-put-error").textContent = errors.ingredients;
        }
        if (errors.price) {
            document.getElementById("price-put-error").textContent = errors.price;
        }
    }
};

function logOut() { // logga ut
    localStorage.removeItem("token"); // tar bort token och gör användaren obehörig
    window.location.href = "index.html" // skickas då till startsida
};

function showOverlay(formToShow) { // visa overlay
    overlay.style.display = 'flex'; // visar overlay

    // döljer allt innehåll för sig
    addForm.style.display = 'none';
    updateForm.style.display = 'none';
    confirmation.style.display = 'none';

    if (formToShow === 'add') {
        addForm.style.display = 'block';
    } else if (formToShow === 'update') {
        updateForm.style.display = 'block';
    } else if (formToShow === 'confirmation') {
        confirmation.style.display = 'block';
    }
};

function closeOverlay() { // dölj overlay
    overlay.style.display = 'none';

    // rensa alla formulär
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    addForm.reset();
    updateForm.reset();
    confirmation.innerHTML = "";
};