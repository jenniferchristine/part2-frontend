"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); logOut();
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
        const response = await fetch("https://pastaplace.onrender.com/protected", {
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

function logOut() {
    localStorage.removeItem("token");
    window.location.href ="index.html"
};