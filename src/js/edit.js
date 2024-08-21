"use strict";

let overlay, resultDiv, confirmation, updateForm, addForm, token; // globala variabler 

// säkerställer att koden körs
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById("logout-btn");
    
    logoutBtn.addEventListener('click', (e) => {
        console.log("Token removed");
        e.preventDefault(); logOut();
    });
    
    // tilldela variabler
    overlay = document.getElementById("overlay");
    resultDiv = document.getElementById("show--dishes");
    confirmation = document.getElementById("confirmation");
    updateForm = document.getElementById("update-form");
    addForm = document.getElementById("add-form");
    token = localStorage.getItem("token");

    document.getElementById("add-to-btn").addEventListener('click', () => { showOverlay('add') });
    document.getElementById("add-btn").addEventListener('click', (e) => { e.preventDefault(); addData(); });
    document.getElementById("cancel-btn").addEventListener('click', () => { closeOverlay() });
    document.getElementById("back-btn").addEventListener('click', () => { closeOverlay() });

    const toggleButton = document.getElementById('toggle-header');
    const header = document.getElementById('header-fixed');

    toggleButton.addEventListener('click', function() {
        header.classList.toggle('nav-open');
    });

    displayData(); // anropar för att visa initial data
});

// hämta data
async function fetchData() {
    const url = "https://pastaplace.onrender.com/dishes";

    try {
        const response = await fetch(url);
        if (!response.ok) { // felhantering
            throw new Error("Could not connect to API" + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data; // returnerar svar från api
    } catch (error) {
        console.error("Could not fetch data", error);
        throw error;
    }
};

// visa data
async function displayData() {
    resultDiv.innerHTML = ""; // rensa befintligt innehåll

    try {
        const data = await fetchData();
        data.forEach(item => createDishElement(item)); // loopen körs genom funktionen som skapar varje item
    } catch (error) {
        console.error("Fault accured:", error);
    }
};

// skapa element för rätter
function createDishElement(item) {
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

// skapa div för knappar
function createButtonDiv(item) {
    const btnDiv = document.createElement("div");
    btnDiv.classList.add("edit-div");

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    const editIcon = document.createElement("span");
    editIcon.classList.add("material-symbols-outlined");
    editIcon.textContent = "edit";
    editBtn.appendChild(editIcon);

    editBtn.dataset.dishID = item._id;
    editBtn.addEventListener('click', () => editDish(item));

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

// addera data
async function addData() {
    const name = document.getElementById("name-add").value;
    const description = document.getElementById("description-add").value;
    const category = document.getElementById("category-add").value;
    const contains = document.getElementById("contains-add").value;
    const ingredients = document.getElementById("ingredients-add").value;
    const price = document.getElementById("price-add").value;

    document.getElementById("name-add-error").textContent = "";
    document.getElementById("description-add-error").textContent = "";
    document.getElementById("category-add-error").textContent = "";
    document.getElementById("contains-add-error").textContent = "";
    document.getElementById("ingredients-add-error").textContent = "";
    document.getElementById("price-add-error").textContent = "";

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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDish)
        });

        const data = await response.json();
        console.log("Responsdata:", data.errors);

        if (!response.ok) {
            handleValidation(data.errors);
            throw new Error("Failed to add data");
        }

        document.getElementById("name-add").value = "";
        document.getElementById("description-add").value = "";
        document.getElementById("category-add").value = "";
        document.getElementById("contains-add").value = "";
        document.getElementById("ingredients-add").value = "";
        document.getElementById("price-add").value = "";
        
        console.log("Data added", data);

        overlay.style.display = 'none';
        confirmationMessage("Din rätt är tillagd!");
        displayData(); // uppdatera sida
    
    } catch (error) {
        console.error("Error when adding data", error);
    }
};

// hitta specifik maträtt att uppdatera
async function updateData(id, update) {
    try {
        const response = await fetch(`https://pastaplace.onrender.com/dishes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(update)
        });

        if (response.ok) {
            console.log("Update successful");

            overlay.style.display = 'none';
            confirmationMessage("Din rätt uppdaterad!");
            displayData(); // uppdatera sidan

        } else {
            console.error("Error: Could not update data");
        }
    } catch (error) {
        console.error("Error while updating", error);
    }
};

// uppdatera maträtt
function editDish(item) {
    document.getElementById("name").value = item.name;
    document.getElementById("description").value = item.description;
    document.getElementById("ingredients").value = item.ingredients;
    document.getElementById("category").value = item.category;
    document.getElementById("contains").value = item.contains;
    document.getElementById("price").value = item.price;

    showOverlay('update');

    updateForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedDish = {
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            ingredients: document.getElementById("ingredients").value,
            category: document.getElementById("category").value,
            contains: document.getElementById("contains").value,
            price: document.getElementById("price").value
        };
        updateData(item._id, updatedDish);
    };
};

// visa bekräftelse
async function showConfirmation(message) {
    showOverlay('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // scrollar upp för 

    return new Promise((resolve, reject) => {
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
            console.log("yesBtn");
            confirmation.innerHTML = "";
            overlay.style.display = 'none';

            resolve(true);
        });

        noBtn.addEventListener('click', () => {
            console.log("noBtn");
            confirmation.innerHTML = "";
            overlay.style.display = 'none';

            resolve(false);
        });
    }); 
};

// bekräftelsemeddelanden
function confirmationMessage(message) {
    const confirmation = document.querySelector(".banner--third");  
    confirmation.style.display = 'flex';

    confirmation.innerHTML = `<p>${message}`;
};

// bekräfta radera
async function confirmDeletion(id) {
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

// radera data
async function deleteData(id) {
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
    console.log("Rätten är raderad");

    confirmationMessage("Din rätt är raderad!");
    displayData();
};

// hantera felmeddelanden
function handleValidation(errors) {
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

// visa overlay
function showOverlay(formToShow) {
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

// dölj overlay
function closeOverlay() {
    overlay.style.display = 'none';

    // rensa alla formulär
    document.querySelectorAll("error-message").forEach(el => el.textContent = "");
    addForm.reset();
    updateForm.reset();
    confirmation.innerHTML = "";
};

// logga ut
function logOut() {
    localStorage.removeItem("token");
    window.location.href ="index.html"
};