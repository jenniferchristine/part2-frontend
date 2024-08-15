"use strict";

// säkerställer att koden körs
document.addEventListener('DOMContentLoaded', () => {

    const cancelBtn = document.getElementById("cancel-btn");
    cancelBtn.addEventListener('click', () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = 'none';
    });

    const addBtn = document.getElementById("add-btn");
    addBtn.addEventListener('click', () => {
        const updateForm = document.getElementById("update-form");
        const confirmation = document.getElementById("confirmation");

        overlay.style.display = 'flex';
        updateForm.style.display = 'none';
        confirmation.style.display = 'none';

        addData();
    });

    displayData(); // anropar för att visa initial data
});

// hämtar data
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

// visar data
async function displayData() {
    const resultDiv = document.getElementById("show--dishes"); // hämtar plats

    resultDiv.innerHTML = "";

    try {
        const data = await fetchData();
        data.forEach(item => { // loopar igenom innehåll
            const dishDiv = document.createElement("div"); // skapa div för varje innehåll
            dishDiv.classList.add("result-dish");

            dishDiv.innerHTML = `
                <h1>${item.name}</h1>
                <p><strong>Beskrivning: </strong>${item.description}</p>
                <p><strong>Ingredienser: </strong>${item.ingredients}</p>
                <p><strong>Typ av rätt: </strong>${item.category}</p>
                <p><strong>Innehåller: </strong>${item.contains}</p>
                <p><strong>Pris: </strong>${item.currency}</p>`;

            const btnDiv = document.createElement("div");
            btnDiv.classList.add("edit-div");

            const editBtn = document.createElement("button");
            editBtn.classList.add("edit-btn");
            const editIcon = document.createElement("span");
            editIcon.classList.add("material-symbols-outlined");
            editIcon.textContent = "edit";
            editBtn.appendChild(editIcon);

            editBtn.dataset.dishID = item._id;

            editBtn.addEventListener('click', () => {
                const overlay = document.getElementById("overlay");
                const confirmationWrapper = document.getElementById("confirmation");
                confirmationWrapper.style.display = 'none'
                overlay.style.display = 'flex';

                document.getElementById("name").value = item.name;
                document.getElementById("description").value = item.description;
                document.getElementById("ingredients").value = item.ingredients;
                document.getElementById("category").value = item.category;
                document.getElementById("contains").value = item.contains;
                document.getElementById("price").value = item.price;

                document.getElementById("update-form").onsubmit = (e) => {
                    e.preventDefault();

                    const updatedDish = {
                        name: document.getElementById("name").value,
                        description: document.getElementById("description").value,
                        ingredients: document.getElementById("ingredients").value,
                        category: document.getElementById("category").value,
                        contains: document.getElementById("contains").value,
                        price: document.getElementById("price").value
                    }

                    updateData(item._id, updatedDish);
                };
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn");
            const deleteIcon = document.createElement("span");
            deleteIcon.classList.add("material-symbols-outlined");
            deleteIcon.textContent = "delete";
            deleteBtn.appendChild(deleteIcon);

            deleteBtn.addEventListener('click', async () => {
                const form = document.getElementById("update-form");
                form.style.display = 'none';

                try {
                    const confirmed = await showConfirmation("Är du säker på att du vill radera denna rätten?");

                    if (confirmed) {
                        await deleteData(item._id);
                        resultDiv.removeChild(dishDiv);
                    }
                } catch (error) {
                    console.error("Fault accured:", error);
                }
            });

            btnDiv.appendChild(editBtn);
            btnDiv.appendChild(deleteBtn);
            dishDiv.appendChild(btnDiv);
            resultDiv.appendChild(dishDiv);
        });
    } catch (error) {
        console.error("Fault occurred: ", error);
    }
};

async function addData() {

};

// uppdatera data
async function updateData(id, update) {
    try {
        const response = await fetch(`https://pastaplace.onrender.com/dishes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(update)
        });

        if (response.ok) {
            console.log("Update successful");
            const overlay = document.getElementById("overlay");
            overlay.style.display = "none";

        } else {
            console.error("Error: Could not update data");
        }
    } catch (error) {
        console.error("Error while updating", error);
    }
};

async function showConfirmation(message) {
    const overlay = document.getElementById("overlay");
    overlay.style.display = 'flex';

    return new Promise((resolve, reject) => {
        const confirmationWrapper = document.getElementById("confirmation");
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
        
        confirmationWrapper.appendChild(showConfirmation);

        const yesBtn = confirmationWrapper.querySelector("#yes");
        const noBtn = confirmationWrapper.querySelector("#no");

        yesBtn.addEventListener('click', () => {
            console.log("yesBtn");
            confirmationWrapper.innerHTML = "";
            overlay.style.display = 'none';

            resolve(true);
        });

        noBtn.addEventListener('click', () => {
            console.log("noBtn");
            confirmationWrapper.innerHTML = "";
            overlay.style.display = 'none';

            resolve(false);
        });
    }); 
};

// radera data
async function deleteData(id) {
    const url = `https://pastaplace.onrender.com/dishes/${id}`;

    const response = await fetch(url, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error("Failed to delete data");
    }
    console.log("Rätten är raderad");

    const confirmation = document.querySelector(".banner--third");
    confirmation.style.display = 'block';
    
    confirmation.innerHTML = `
    <span class="material-symbols-outlined">check</span>
    <p>Din rätt är raderad</p>`;
};
