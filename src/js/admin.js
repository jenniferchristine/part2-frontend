"use strict";


document.addEventListener("DOMContentLoaded", () => { // säkerställer att koden körs

    // variabler och händelsehanterare
   const logoutBtn = document.getElementById("logout-btn");
   const toggleButton = document.getElementById('toggle-header');
   const header = document.getElementById('header-fixed');

    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logOut(); });

    toggleButton.addEventListener('click', function() {
        header.classList.toggle('nav-open');
    });

    authorizeUser(); // kallar på autentisering på en gång sidan laddas
});

async function authorizeUser() { // autentiserar en användare genom jwt
    try { 
        const token = localStorage.getItem("token"); // lagrar hämtad token

        if (!token) { // felmeddelande när ingen token hittats
            localStorage.setItem("redirected", "true");
            throw new Error("Failed - Token missing");
        }
        const response = await fetch("https://pastaplace.onrender.com/admin", { // kontrollerar skyddad resurs
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` } // skickar med token
        });

        if (!response.ok) {
            throw new Error(`Something went wrong while accessing protected resource: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Something went wrong while accessing protected resource:", error);
        window.location.href = "index.html"
    }
};

function logOut() { // logga ut
    localStorage.removeItem("token"); // tar bort token och gör användaren obehörig
    window.location.href ="index.html" // skickas då till startsida
};