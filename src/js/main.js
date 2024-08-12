"use strict";

// säkerställer att koden körs
document.addEventListener("DOMContentLoaded", () => {
    displayData();
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
    const resultDiv = document.getElementById("result--dish"); // hämtar plats

    try {
        const data = await fetchData();
        data.forEach(item => { // loopar igenom innehåll
            const dishDiv = document.createElement("div"); // skapar div för varje innehåll
            dishDiv.classList.add("column"); // applicerar klass

            dishDiv.innerHTML = `
            <h2>${item.name}</h2>
            <p class="smaller">${item.description}</p>
            <h3>Ingredienser:</h3>
            <p>${item.ingredients}</p>
            <h3>Innerhåller:</h3>
            <p>${item.contains}</p>
            <p class="right">${item.currency}</p>`

            resultDiv.appendChild(dishDiv);
        });
    } catch (error) {
        console.error("Fault accured: ", error);
    }
};