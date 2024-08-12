"use strict";

// säkerställer att koden körs
document.addEventListener("DOMContentLoaded", () => {
    displayData();

    const addBtn = document.getElementById("confirmBtn");

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addData();
        })
    }

    // variabler och event för avbryt-knapp samt att komma till formulär
    const overlay = document.getElementById('overlay');
    const bookingBtn = document.getElementById('bookingBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (bookingBtn && cancelBtn) {
        bookingBtn.addEventListener('click', () => {
            overlay.style.display = 'flex'; // Visa overlay
        });

        cancelBtn.addEventListener('click', () => {
            overlay.style.display = 'none'; // Dölj overlay
        });
    } else {
        console.error('Knappen eller overlay-elementet hittades inte.');
    }

    // smooth scroll av navigering
    const scrollToElement = (e) => {
        e.preventDefault();

        const targetSelector = e.currentTarget.getAttribute("href");
        const targetEl = document.querySelector(targetSelector);

        if (targetEl) {
            targetEl.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    const links = document.querySelector("nav ul li a");

    links.forEach(link => {
        link.addEventListener('click', scrollToElement);
    });
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

// addera formdata
async function addData() {

    //hämtar värde från alla inputs
    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const guests = parseInt(document.getElementById("guests").value); // omvandlar till tal
    const bookingDate = document.getElementById("bookingDate").value;
    const time = document.getElementById("time").value;
    const requests = document.getElementById("requests").value;

    // kombinerar tid och datum till ett iso
    const bookingDateTime = new Date(`${bookingDate}T${time}`);

    // justera tidszon genom att lägga till förskjutning
    const offsetMinutes = bookingDateTime.getTimezoneOffset();
    bookingDateTime.setMinutes(bookingDateTime.getMinutes() - offsetMinutes);

    // skapar fält för felmeddelanden
    document.getElementById("nameError").textContent = "";
    document.getElementById("phoneNumberError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("guestsError").textContent = "";
    document.getElementById("bookingDateError").textContent = "";
    document.getElementById("timeError").textContent = "";
    document.getElementById("requestsError").textContent = "";

    // skapar objekt för samlad data
    const booking = {
        customer: {
            name: name,
            phoneNumber: phoneNumber,
            email: email
        },
        bookingDate: bookingDateTime, // skickar kombinerad tid och datum
        guests: guests,
        requests: requests
    };

    const url = "https://pastaplace.onrender.com/bookings";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });

        const data = await response.json();
        console.log("Responsdata:", data.errors);

        if (!response.ok) {
            handleValidation(data.errors);
            throw new Error("Failed to add data");
        }

        // töm fält efter tillägg
        document.getElementById("name").value = "";
        document.getElementById("phoneNumber").value = "";
        document.getElementById("email").value = "";
        document.getElementById("guests").value = "";
        document.getElementById("bookingDate").value = "";
        document.getElementById("time").value = "";
        document.getElementById("requests").value = "";

        console.log("Data added", data);

    } catch (error) {
        console.error("Error when adding data", error);
    }
};

// hantera validering
function handleValidation(errors) {
    if (errors) {
        if (errors["customer.name"]) {
            document.getElementById("nameError").textContent = errors["customer.name"];
        }
        if (errors["customer.phoneNumber"]) {
            document.getElementById("phoneNumberError").textContent = errors["customer.phoneNumber"];
        }
        if (errors["customer.email"]) {
            document.getElementById("emailError").textContent = errors["customer.email"];
        }
        if (errors.guests) {
            document.getElementById("guestsError").textContent = errors.guests;
        }
        if (errors.bookingDate) {
            document.getElementById("bookingDateError").textContent = errors.bookingDate;
        }
        if (errors.bookingDate) {
            document.getElementById("timeError").textContent = errors.bookingDate;
        }
        if (errors.requests) {
            document.getElementById("requestsError").textContent = errors.requests;
        }
    }
};

