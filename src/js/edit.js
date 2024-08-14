"use strict";

// säkerställer att koden körs
document.addEventListener('DOMContentLoaded', () => {

    const cancelBtn = document.getElementById("cancel-btn");
    cancelBtn.addEventListener('click', () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
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
                console.log(item._id);

                const overlay = document.getElementById("overlay");
                overlay.style.display = "flex";

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

            btnDiv.appendChild(editBtn);
            btnDiv.appendChild(deleteBtn);
            dishDiv.appendChild(btnDiv);
            resultDiv.appendChild(dishDiv);
        });
    } catch (error) {
        console.error("Fault occurred: ", error);
    }
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
