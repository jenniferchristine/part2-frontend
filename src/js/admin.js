"use strict";

// säkerställer att koden körs
document.addEventListener("DOMContentLoaded", () => {
   const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); logOut();
    });

    const toggleButton = document.getElementById('toggle-header');
    const header = document.getElementById('header-fixed');

    toggleButton.addEventListener('click', function() {
        header.classList.toggle('nav-open');
    });

    authorizeUser();
});

async function authorizeUser() {
    try { 
        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.setItem("redirected", "true");
            throw new Error("Failed - Token missing");
        }

        // kontrollera skyddad resurs
        const response = await fetch("https://pastaplace.onrender.com/admin", {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Something went wrong while accessing protected resource: ${response.statusText}`);
        }
        console.log("You are now on protected route", token);

    } catch (error) {
        console.error("Something went wrong while accessing protected resource:", error);
        window.location.href = "index.html"
    }
}

// logga ut
function logOut() {
    localStorage.removeItem("token");
    window.location.href ="index.html"
};