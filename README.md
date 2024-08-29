<div align="center" style="background-color: #518b99; padding: 2.5em;">
<img src="src/images/logo_jeja.svg">
<br>

### Jennifer Jakobsson
</div>
<br>

# Backend-baserad webbutveckling
### Projektarbete del 2, DT207G

<br>
<br>

# Webbplats och administrationsgränssnitt

>### Beskrivning av projektarbete del 2:
> Detta är den andra delen av projektarbetet i kurs DT207G. I denna laboration har jag skapat en webbplats ([länk till publicerad webbplats](https://jeja2306-dt207g-moment4.netlify.app/)) som använder Fetch API för att logga in, autentisera och förändra data i en databas. 
>
>Webbplatsen är skapat åt ett fiktivt företaget vid namn Pasta Place. Detta är en resutrang som specialiserar sig på pastarätter. På deras publika webbplats kan besökare se resturangens meny och boka bord. Admin (personal) kan logga in för att då autentiseras och därmed få tillgång till skyddat innehåll (detta görs med hjälp av JWT). I detta innehåll kan personen uppdatera och radera bokningar/maträtter samt addera nyheter till menyn.
>
>För att påverka innehållet i databasen används CRUD (create, read, update and delete). Från denna del skickas GET, POST, PUT och DELETE förfrågningar för detta. 
>
> [Länk till Github-repo för webbtjänst](https://github.com/jenniferchristine/part1-backend.git) (innehåller objektdata)<br>
> [Länk till webbtjänst](https://pastaplace.onrender.com/)

<br>

#### Routes kan se ut som följande:

<br>

| Metod | Ändpunkt | Beskrivning |
|-----------------|-----------------|-----------------|
| GET | / | Hämtar webbtjänsten |
| GET | /admin | Skapar route som kräver autentisering |
| POST | /login | Route för inloggning (skapar token) |
| POST | /register | Route för registrering |
|
| GET | /dishes | Hämtar lagrade maträtter |
| POST | /dishes | Lagrar maträtt (kräver autentisering) |
| PUT | /dishes | Uppdaterar maträtt (kräver autentisering) |
| DELETE | /dishes | Raderar maträtt (kräver autentisering) |
|
| GET | /bookings | Hämtar lagrade bokningar (kräver autentisering) |
| POST | /bookings | Lagrar bokning |
| PUT | /bookings | Uppdaterar bokning (kräver autentisering) |
| DELETE | /bookings | Raderar bokning (kräver autentisering) |

<br>

#### En förfrågan med autentisering kan se ut så här:

<br>

```javascript
const response = await fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```