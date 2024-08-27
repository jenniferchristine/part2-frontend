"use strict";

let overlay, resultDiv, confirmation, addForm, updateForm, token; // globala variabler

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); logOut();
    });

    overlay = document.getElementById("overlay");
    resultDiv = document.getElementById("show--bookings");
    confirmation = document.getElementById("confirmation");
    addForm = document.getElementById("add-form");
    updateForm = document.getElementById("update-form");
    token = localStorage.getItem("token");

    document.getElementById("add-btn").addEventListener('click', (e) => { e.preventDefault(); addData(); });
    document.getElementById("add-to-btn").addEventListener('click', () => { showOverlay('add') });
    document.getElementById("cancel-btn").addEventListener('click', () => { closeOverlay() });
    document.getElementById("back-btn").addEventListener('click', () => { closeOverlay() });

    const toggleButton = document.getElementById('toggle-header');
    const header = document.getElementById('header-fixed');

    toggleButton.addEventListener('click', function() {
        header.classList.toggle('nav-open');
    });

    displayData();
});

// hämta data
async function fetchData() {
    const url = "https://pastaplace.onrender.com/bookings";

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) { // felhantering
            throw new Error("Could not connect to API" + response.statusText);
        }
        const data = await response.json();
        console.log("You are now on protected route | Visar bokningsdata", token);
        return data; // returnerar svar från api

    } catch (error) {
        console.error("Could not fetch data", error);
        throw error;
    }
};

// visa data
async function displayData() {
    const loadingIndicator = document.getElementById("loading-indicator");  // hämta och visa laddning
    loadingIndicator.style.display = 'flex';
    resultDiv.innerHTML = ""; // rensa befintligt innehåll

    try {
        const data = await fetchData();
        data.forEach(item => createBookingElement(item)); // loopen körs genom funktionen som skapar varje item
    } catch (error) {
        console.error("Fault accured:", error);
    } finally {
        loadingIndicator.style.display = "none"; // Dölj laddningsindikatorn
    }
};

// skapa element för rätter
function createBookingElement(item) {
    const bookingDiv = document.createElement("div");
    bookingDiv.classList.add("result-booking");

    // konverterar bookingdate
    const bookingDate = new Date(item.bookingDate);
    const formattedDate = bookingDate.toISOString().split('T')[0]; 
    const formattedTime = bookingDate.toISOString().split('T')[1].substring(0, 5); 

    let statusClass = "";
    switch (item.status) {
        case "Pending":
            statusClass = "status-pending";
            break;
        case "Confirmed":
            statusClass = "status-confirmed";
            break;
        case "Cancelled":
            statusClass = "status-cancelled";
            break;
        default:
            statusClass = ""; // ingen speciell klass
            break;
    }

    bookingDiv.innerHTML = `
    <p class="status-text ${statusClass}"><strong>Status: </strong>${item.status}</p>
    <p><strong>Namn: </strong>${item.customer.name}</p>
    <p><strong>Telefonnummer: </strong>${item.customer.phoneNumber}</p>
    <p><strong>E-postadress: </strong>${item.customer.email}</p>
    <p><strong>Antal gäster: </strong>${item.guests}</p>
    <p><strong>Datum: </strong>${formattedDate}</p>
    <p><strong>Tid: </strong>${formattedTime}</p>
    <p><strong>Önskemål: </strong>${item.requests}</p><br>
    <p><strong>Bokningsnummer: </strong><br>${item._id}</p>`;

    const btnDiv = createButtonDiv(item); // skapar alla knappar för sig
    bookingDiv.appendChild(btnDiv);
    resultDiv.appendChild(bookingDiv);
};

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
    editBtn.addEventListener('click', () => editBookings(item));

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

        overlay.style.display = 'none';

        if (data._id) {
            confirmationMessage(`Bokning: ${data._id} är skapad!`);
        } else {
            confirmationMessage("Bokningen är skapad!");
        }
        
        displayData(); // uppdatera sida

    } catch (error) {
        console.error("Error when adding data", error);
    }
};

// hitta specifik och uppdatera
async function updateData(id, update) {
    try {
        const response = await fetch(`https://pastaplace.onrender.com/bookings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(update)
        });

        if (response.ok) {
            console.log("You are now on protected route | Uppdaterar bokningsdata", token);

            overlay.style.display = 'none';
            confirmationMessage("Bokningen är uppdaterad!");
            displayData(); // uppdatera sidan

        } else {
            const errorData = await response.json();
            console.error("Error: Could not update data", errorData);
        }
    } catch (error) {
        console.error("Error while updating", error);
    }
};

// uppdatera bokning och måla ut
function editBookings(item) {
    // fyll i formulärfälten med existerande värden
    document.getElementById("status-edit").value = item.status;
    document.getElementById("name-edit").value = item.customer.name;
    document.getElementById("phoneNumber-edit").value = item.customer.phoneNumber;
    document.getElementById("email-edit").value = item.customer.email;
    document.getElementById("guests-edit").value = item.guests;
    
    const bookingDate = new Date(item.bookingDate).toISOString().split('T')[0];
    document.getElementById("bookingDate-edit").value = bookingDate;
    
    const bookingTime = new Date(item.bookingDate).toISOString().split('T')[1].substring(0, 5);
    document.getElementById("time-edit").value = bookingTime;
    
    document.getElementById("requests-edit").value = item.requests;

    showOverlay('update');

    const updateForm = document.getElementById("update-form");
    updateForm.onsubmit = (e) => {
        e.preventDefault();

        // hämta uppdaterade värden från formuläret
        const updatedStatus = document.getElementById("status-edit").value;
        const updatedName = document.getElementById("name-edit").value;
        const updatedPhoneNumber = document.getElementById("phoneNumber-edit").value;
        const updatedEmail = document.getElementById("email-edit").value;
        const updatedGuests = parseInt(document.getElementById("guests-edit").value);
        const updatedBookingDate = document.getElementById("bookingDate-edit").value;
        const updatedTime = document.getElementById("time-edit").value;
        const updatedRequests = document.getElementById("requests-edit").value;

        // kombinera datum och tid till en ISO-tidsstämpel
        const bookingDateTime = new Date(`${updatedBookingDate}T${updatedTime}`);
        const offsetMinutes = bookingDateTime.getTimezoneOffset();
        bookingDateTime.setMinutes(bookingDateTime.getMinutes() - offsetMinutes);

        // skapa objekt för uppdaterad data
        const updatedBooking = {
            status: updatedStatus,
            customer: {
                name: updatedName,
                phoneNumber: updatedPhoneNumber,
                email: updatedEmail
            },
            bookingDate: bookingDateTime.toISOString(), 
            guests: updatedGuests,
            requests: updatedRequests
        };

        // Anropa funktionen för att uppdatera data
        updateData(item._id, updatedBooking);
    };
};

// bekräftelsemeddelanden
function confirmationMessage(message) {
    const confirmation = document.querySelector(".banner--third");  
    confirmation.style.display = 'flex';

    confirmation.innerHTML = `<p>${message}`;
};

// radera data
async function deleteData(id) {
    const url = `https://pastaplace.onrender.com/bookings/${id}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete data");
    }
    console.log("Bokningen är raderad");

    if (id) {
        confirmationMessage(`Bokning: ${id} är raderad!`);
    } else {
        confirmationMessage("Bokningen är raderad!");
    }

    
    displayData();
};

// bekräfta radera
async function confirmDeletion(id) {
    try {
        const confirmed = await showConfirmation("Är du säker på att du vill radera denna bokning?");
        if (confirmed) {
            await deleteData(id);
            displayData();
        }
    } catch (error) {
        console.error("Error occurred during deletion:", error);
    }
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