# PossuKino REST API Dokumentaatio

## Yleistiedot
- **Base URL:** `http://localhost:3001`
- **Testaus Base URL:** `http://localhost:3002` (kun API käynnissä testidatakannassa)
- **Content-Type:** `application/json`
- **Autentikointi:** JWT Bearer Token cookies / Authorization header

---

## 1. Käyttäjät (Users)

### 1.1 Rekisteröinti
```
POST /user/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Vastaus:** Käyttäjä objekti + tokens

---

### 1.2 Kirjautuminen
```
POST /user/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```
**Vastaus:** `{ accessToken, refreshToken, user }`

---

### 1.3 Hae kaikki käyttäjät
```
GET /user
```
**Vastaus:** Käyttäjät lista

---

### 1.4 Hae käyttäjä ID:llä
```
GET /user/:id
```
**Vastaus:** Käyttäjä objekti

---

### 1.5 Hae poistettu käyttäjä
```
GET /user/deleted/:id
```
**Vastaus:** Poistetun käyttäjän tiedot

---

### 1.6 Päivitä käyttäjä
```
PUT /user/:id
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  ...
}
```
**Vastaus:** Päivitetty käyttäjä objekti

---

### 1.7 Vaihda salasana
```
PUT /user/:id/password
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string"
}
```
**Vastaus:** Onnistumisviesti

---

### 1.8 Poista käyttäjä
```
DELETE /user/:id
```
**Vastaus:** Onnistumisviesti

---

## 2. TMDB Elokuva API (TMDB Movies)

### 2.1 Hae elokuvan genret
```
GET /tmdb/genres
```
**Vastaus:**
```json
[
  { "id": 28, "name": "Action" },
  { "id": 12, "name": "Adventure" },
  ...
]
```

---

### 2.2 Hae elokuvia tekstillä (Search)
```
GET /tmdb/search?q=Matrix&page=1&genres=28,35&certification=PG-13
```
**Query Parametrit:**
- `q` (string): Hakuteksti (pakollinen jos ei filttereita)
- `page` (number): Sivu (oletus: 1)
- `genres` (string): Pilkulla eroteltu lista genre ID:tä (valinnainen)
- `certification` (string): Ikäraja G, PG, PG-13, R, NC-17 (valinnainen)

**Vastaus:**
```json
{
  "results": [
    {
      "tmdb_id": 603,
      "movie_id": 603,
      "movie_title": "The Matrix",
      "movie_description": "...",
      "movie_year": "1999",
      "movie_image": "https://..."
    },
    ...
  ],
  "page": 1,
  "total_pages": 15
}
```

---

### 2.3 Hae suosituimmat elokuvat
```
GET /tmdb/popular?page=1
```
**Query Parametrit:**
- `page` (number): Sivu (oletus: 1)

**Vastaus:** Sama muoto kuin haku

---

### 2.4 Hae elokuvan tiedot
```
GET /tmdb/movie/:id
```
**Vastaus:** Elokuva objekti (sama muoto kuin haku tuloset)

---

## 3. Suosikit (Favorites)

### 3.1 Hae kaikki suosikit
```
GET /favorites
```
**Vastaus:** Suosikit lista

---

### 3.2 Hae suosikki ID:llä
```
GET /favorites/:favorite_id
```
**Vastaus:** Suosikki objekti

---

### 3.3 Lisää elokuva suosikkeihin
```
POST /favorites
Content-Type: application/json

{
  "user_id": number,
  "tmdb_id": number,
  "movie_title": "string",
  "movie_image": "string",
  "movie_description": "string"
}
```
**Vastaus:** Lisätty suosikki objekti

---

### 3.4 Päivitä suosikki
```
PUT /favorites/:favorite_id
Content-Type: application/json

{
  "user_id": number,
  "tmdb_id": number,
  ...
}
```
**Vastaus:** Päivitetty suosikki objekti

---

### 3.5 Poista suosikki
```
DELETE /favorites/:favorite_id
```
**Vastaus:** Onnistumisviesti

---

## 4. Ryhmät (Groups)

### 4.1 Hae kaikki ryhmät
```
GET /group
```
**Vastaus:** Ryhmät lista

---

### 4.2 Hae ryhmä ID:llä
```
GET /group/:group_id
```
**Vastaus:** Ryhmä objekti

---

### 4.3 Etsi ryhmiä tekstillä
```
GET /group/search?q=sarjat
```
**Query Parametrit:**
- `q` (string): Hakuteksti

**Vastaus:**
```json
[
  {
    "group_id": 1,
    "group_name": "Sarjojen ystävät",
    "group_description": "...",
    "created_by": 5,
    "created_at": "2024-01-15"
  },
  ...
]
```

---

### 4.4 Luo ryhmä (Vaatii autentikointia)
```
POST /group
Content-Type: application/json
Authorization: Bearer <token>

{
  "group_name": "string",
  "group_description": "string",
  "created_by": number
}
```
**Vastaus:** Luotu ryhmä objekti

---

### 4.5 Päivitä ryhmä
```
PUT /group/:group_id
Content-Type: application/json

{
  "group_name": "string",
  "group_description": "string"
}
```
**Vastaus:** Päivitetty ryhmä objekti

---

### 4.6 Poista ryhmä
```
DELETE /group/:group_id
```
**Vastaus:** Onnistumisviesti

---

## 5. Ryhmän jäsenet (Group Members)

### 5.1 Hae kaikki ryhmän jäsenet
```
GET /group_members
```
**Vastaus:** Jäsenet lista

---

### 5.2 Hae jäsen ID:llä
```
GET /group_members/:member_id
```
**Vastaus:** Jäsen objekti

---

### 5.3 Lisää jäsen ryhmään (Vaatii autentikointia)
```
POST /group_members
Content-Type: application/json
Authorization: Bearer <token>

{
  "group_id": number,
  "user_id": number,
  "joined_at": "timestamp"
}
```
**Vastaus:** Lisätty jäsen objekti

---

### 5.4 Päivitä jäsen (Vaatii autentikointia)
```
PUT /group_members/:member_id
Content-Type: application/json
Authorization: Bearer <token>

{
  "group_id": number,
  "user_id": number,
  ...
}
```
**Vastaus:** Päivitetty jäsen objekti

---

### 5.5 Poista jäsen (Vaatii autentikointia)
```
DELETE /group_members/:member_id
Authorization: Bearer <token>
```
**Vastaus:** Onnistumisviesti

---

## 6. Ryhmän elokuvat (Group Movies)

### 6.1 Hae ryhmän elokuvat
```
GET /group_movies?group_id=1
```
**Query Parametrit:**
- `group_id` (number): Ryhmän ID

**Vastaus:**
```json
[
  {
    "group_movie_id": 1,
    "group_id": 1,
    "tmdb_id": "603",
    "movie_title": "The Matrix",
    "movie_image": "https://...",
    "movie_description": "...",
    "added_reason": "Klassikko",
    "added_by": 5,
    "created_at": "2024-01-20"
  },
  ...
]
```

---

### 6.2 Hae ryhmän elokuvat ID:llä
```
GET /group_movies/:group_id
```
**Vastaus:** Sama muoto kuin edellä

---

### 6.3 Lisää elokuva ryhmään (Vaatii autentikointia)
```
POST /group_movies
Content-Type: application/json
Authorization: Bearer <token>

{
  "group_id": number,
  "tmdb_id": "string",
  "movie_title": "string",
  "movie_image": "string",
  "movie_description": "string",
  "added_reason": "string",
  "added_by": number
}
```
**Vastaus:** Lisätty ryhmän elokuva objekti

---

### 6.4 Poista elokuva ryhmästä (Vaatii autentikointia)
```
DELETE /group_movies/:group_movie_id
Authorization: Bearer <token>
```
**Vastaus:** Onnistumisviesti

---

## 7. Arvostelut (Reviews)

### 7.1 Hae kaikki arvostelut
```
GET /reviews
```
**Vastaus:** Arvostelut lista

---

### 7.2 Hae arvostelu ID:llä
```
GET /reviews/:review_id
```
**Vastaus:** Arvostelu objekti

---

### 7.3 Lisää arvostelu
```
POST /reviews
Content-Type: application/json

{
  "user_id": number,
  "tmdb_id": number,
  "rating": number,
  "review_text": "string",
  "created_at": "timestamp"
}
```
**Vastaus:** Lisätty arvostelu objekti

---

### 7.4 Päivitä arvostelu
```
PUT /reviews/:review_id
Content-Type: application/json

{
  "rating": number,
  "review_text": "string"
}
```
**Vastaus:** Päivitetty arvostelu objekti

---

### 7.5 Poista arvostelu
```
DELETE /reviews/:review_id
```
**Vastaus:** Onnistumisviesti

---

## 8. Elokuvat (Movies)

### 8.1 Hae kaikki elokuvat
```
GET /movies
```
**Vastaus:** Elokuvat lista

---

### 8.2 Hae elokuva ID:llä
```
GET /movies/:id
```
**Vastaus:** Elokuva objekti

---

### 8.3 Lisää elokuva
```
POST /movies
Content-Type: application/json

{
  "tmdb_id": number,
  "movie_title": "string",
  "movie_description": "string",
  "release_date": "date",
  "movie_image": "string"
}
```
**Vastaus:** Lisätty elokuva objekti

---

### 8.4 Päivitä elokuva
```
PUT /movies/:id
Content-Type: application/json

{
  "movie_title": "string",
  ...
}
```
**Vastaus:** Päivitetty elokuva objekti

---

### 8.5 Poista elokuva
```
DELETE /movies/:id
```
**Vastaus:** Onnistumisviesti

---

## 9. Genret (Genres)

### 9.1 Hae kaikki genret
```
GET /genres
```
**Vastaus:**
```json
[
  {
    "genre_id": 1,
    "genre_name": "Action"
  },
  ...
]
```

---

### 9.2 Hae genre ID:llä
```
GET /genres/:genre_id
```
**Vastaus:** Genre objekti

---

### 9.3 Lisää genre
```
POST /genres
Content-Type: application/json

{
  "genre_name": "string"
}
```
**Vastaus:** Lisätty genre objekti

---

### 9.4 Päivitä genre
```
PUT /genres/:genre_id
Content-Type: application/json

{
  "genre_name": "string"
}
```
**Vastaus:** Päivitetty genre objekti

---

### 9.5 Poista genre
```
DELETE /genres/:genre_id
```
**Vastaus:** Onnistumisviesti

---

## 10. Elokuvan Genret (Movie-Genre Mappings)

### 10.1 Hae elokuvan genret
```
GET /movie_genres?movie_id=1
```
**Vastaus:** Genret lista

---

### 10.2 Lisää genre elokuvalle
```
POST /movie_genres
Content-Type: application/json

{
  "movie_id": number,
  "genre_id": number
}
```
**Vastaus:** Lisätty mapping

---

### 10.3 Poista genre elokuvalta
```
DELETE /movie_genres/:movie_genre_id
```
**Vastaus:** Onnistumisviesti

---

## 11. Ryhmän viestit (Group Messages)

### 11.1 Hae ryhmän viestit
```
GET /group_messages?group_id=1
```
**Vastaus:** Viestit lista

---

### 11.2 Lisää viesti
```
POST /group_messages
Content-Type: application/json

{
  "group_id": number,
  "user_id": number,
  "message_text": "string",
  "created_at": "timestamp"
}
```
**Vastaus:** Lisätty viesti objekti

---

### 11.3 Poista viesti
```
DELETE /group_messages/:message_id
```
**Vastaus:** Onnistumisviesti

---

## 12. Tiedostojen lataus (Upload)

### 12.1 Lataa käyttäjän profiilikuva
```
POST /upload/user/:user_id/profile_picture
Content-Type: multipart/form-data

Form data:
- file: <image file>
```
**Vastaus:** `{ filePath: "string" }`

---
