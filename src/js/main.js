"use strict";

// säkerställer att koden körs
document.addEventListener("DOMContentLoaded", () => {
    const toTopBtn = document.getElementById("topBtn"); // scrolla till toppen-knapp

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            toTopBtn.style.display = 'block';
        } else {
            toTopBtn.style.display = 'none';
        }
    });

    toTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    });

    // variabler och event för knappar
    const overlay = document.getElementById('overlay');

    const bookingForm = document.getElementById("booking-form");
    const bookingBtn = document.getElementById('booking-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const addBtn = document.getElementById("confirm-btn");

    const loginForm = document.getElementById("login-form");
    const adminBtn = document.getElementById('admin-btn');
    const loginBtn = document.getElementById('login-btn');

    if (bookingBtn && cancelBtn && addBtn) {
        bookingBtn.addEventListener('click', () => {
            overlay.style.display = 'flex'; // visa overlay
            loginForm.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            overlay.style.display = 'none'; // dölj overlay
            window.location.href = "/index.html";
        });

        addBtn.addEventListener('click', () => { addData(); });
    }

    if (adminBtn && loginBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault(); // förhindra att sidan scrollas upp
            overlay.style.display = 'flex';
            bookingForm.style.display = 'none';
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); logIn();
        });
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

    const links = document.querySelectorAll(".scroll-link");

    links.forEach(link => {
        link.addEventListener('click', scrollToElement);
    });

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
            <h3>Innehåller:</h3>
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

async function logIn() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    document.getElementById("usernameError").textContent = "";
    document.getElementById("passwordError").textContent = "";

    try {
        if (!username) {
            document.getElementById("usernameError").textContent = "Vänligen ange ett användarnamn";
        }
        if (!password) {
            document.getElementById("passwordError").textContent = "Skriv in ett lösenord";
        }
        const response = await fetch("https://pastaplace.onrender.com/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password})
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.response.token); // lagra token
            window.location.href = "admin.html"; // omdirigerar till säkrad sida
        } else {
            if (data.error === "Incorrect username or password") {
                document.getElementById().textContent = "Felaktigt användarnamn eller lösenord";
            } else {
                console.error("Error", data.error);
            }
        }
    } catch (error) {
        console.error("Server error:", error);
        document.getElementById("usernameError").textContent = "Ett fel uppstod vid inloggningen. Vänligen försök igen senare!"
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

