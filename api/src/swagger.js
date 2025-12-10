import swaggerJSDoc from 'swagger-jsdoc';

const port = process.env.PORT || 3001;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PossuKino API',
    version: '1.0.0',
    description: 'Swagger-dokumentaatio PossuKino REST API -rajapinnoille.'
  },
  servers: [
    { url: `http://localhost:${port}`, description: 'Local (dev)' },
    { url: 'http://localhost:3002', description: 'Local (test)' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'secret' }
        },
        required: ['email', 'password']
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'matti' },
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'secret' }
        },
        required: ['username', 'email', 'password']
      },
      MovieSearchResponse: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tmdb_id: { type: 'integer', example: 603 },
                movie_title: { type: 'string', example: 'The Matrix' },
                movie_description: { type: 'string' },
                movie_year: { type: 'string', example: '1999' },
                movie_image: { type: 'string', example: 'https://image.tmdb.org/t/p/w342/...' }
              }
            }
          },
          page: { type: 'integer', example: 1 },
          total_pages: { type: 'integer', example: 15 }
        }
      }
    }
  }
};

const paths = {
  '/user/register': {
    post: {
      tags: ['Auth'],
      summary: 'Rekisteröi uusi käyttäjä',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
        }
      },
      responses: {
        201: { description: 'Käyttäjä luotu' },
        400: { description: 'Virheellinen pyyntö' }
      }
    }
  },
  '/user/login': {
    post: {
      tags: ['Auth'],
      summary: 'Kirjaudu sisään',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
        }
      },
      responses: {
        200: { description: 'Kirjautuminen onnistui' },
        401: { description: 'Väärä tunnus tai salasana' }
      }
    }
  },
  '/tmdb/search': {
    get: {
      tags: ['TMDB'],
      summary: 'Hae elokuvia TMDB:stä',
      parameters: [
        { name: 'q', in: 'query', description: 'Hakuteksti', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'genres', in: 'query', description: 'Genre ID:t pilkulla eroteltuna', schema: { type: 'string' } },
        { name: 'certification', in: 'query', description: 'Ikäraja, esim. PG-13', schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Hakutulokset', content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieSearchResponse' } } } },
        500: { description: 'Palvelinvirhe' }
      }
    }
  },
  '/tmdb/genres': {
    get: {
      tags: ['TMDB'],
      summary: 'Hae TMDB-genret',
      responses: { 200: { description: 'Lista genreistä' } }
    }
  },
  '/tmdb/movie/{id}': {
    get: {
      tags: ['TMDB'],
      summary: 'Hae elokuvan tiedot TMDB:stä',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'TMDB ID' }
      ],
      responses: { 200: { description: 'Elokuvan tiedot' }, 404: { description: 'Ei löytynyt' } }
    }
  },
  '/user': {
    get: { tags: ['Users'], summary: 'Listaa käyttäjät', responses: { 200: { description: 'Käyttäjälista' } } },
    post: { tags: ['Users'], summary: 'Luo käyttäjä', responses: { 201: { description: 'Luotu' } } }
  },
  '/user/{id}': {
    get: { tags: ['Users'], summary: 'Hae käyttäjä', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'OK' }, 404: { description: 'Ei löydy' } } },
    put: { tags: ['Users'], summary: 'Päivitä käyttäjä', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'Päivitetty' } } },
    delete: { tags: ['Users'], summary: 'Poista käyttäjä', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'Poistettu' } } }
  },
  '/user/deleted/{id}': {
    get: { tags: ['Users'], summary: 'Hae poistettu käyttäjä', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'OK' }, 404: { description: 'Ei löydy' } } }
  },
  '/user/{id}/password': {
    put: { tags: ['Users'], summary: 'Vaihda salasana', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'Vaihdettu' }, 400: { description: 'Virheellinen' } } }
  },
  '/cache/popular': {
    get: { tags: ['Cache'], summary: 'Hae suosikit välimuistista' }
  },
  '/cache/search': {
    get: { tags: ['Cache'], summary: 'Hae elokuvia välimuistista', parameters: [{ name: 'q', in: 'query', required: true }] }
  },
  '/movies': {
    get: { tags: ['Movies'], summary: 'Listaa elokuvat' },
    post: { tags: ['Movies'], summary: 'Lisää elokuva' }
  },
  '/movies/search': {
    get: { tags: ['Movies'], summary: 'Hae elokuvia (local DB)' }
  },
  '/movies/{tmdb_id}': {
    get: { tags: ['Movies'], summary: 'Hae elokuva', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] },
    put: { tags: ['Movies'], summary: 'Päivitä elokuva', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] },
    delete: { tags: ['Movies'], summary: 'Poista elokuva', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] }
  },
  '/movie_genres': {
    get: { tags: ['MovieGenres'], summary: 'Listaa elokuva-genret' },
    post: { tags: ['MovieGenres'], summary: 'Lisää genre elokuvalle' }
  },
  '/movie_genres/{tmdb_id}': {
    get: { tags: ['MovieGenres'], summary: 'Hae elokuvan genret', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] },
    put: { tags: ['MovieGenres'], summary: 'Päivitä elokuvan genret', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] },
    delete: { tags: ['MovieGenres'], summary: 'Poista elokuvan genret', parameters: [{ name: 'tmdb_id', in: 'path', required: true }] }
  },
  '/genres': {
    get: { tags: ['Genres'], summary: 'Listaa genret' },
    post: { tags: ['Genres'], summary: 'Lisää genre' }
  },
  '/genres/{genre_id}': {
    get: { tags: ['Genres'], summary: 'Hae genre', parameters: [{ name: 'genre_id', in: 'path', required: true }] },
    put: { tags: ['Genres'], summary: 'Päivitä genre', parameters: [{ name: 'genre_id', in: 'path', required: true }] },
    delete: { tags: ['Genres'], summary: 'Poista genre', parameters: [{ name: 'genre_id', in: 'path', required: true }] }
  },
  '/group_members': {
    get: { tags: ['GroupMembers'], summary: 'Listaa jäsenet' },
    post: { tags: ['GroupMembers'], summary: 'Lisää jäsen', security: [{ bearerAuth: [] }] }
  },
  '/group_members/{member_id}': {
    get: { tags: ['GroupMembers'], summary: 'Hae jäsen', parameters: [{ name: 'member_id', in: 'path', required: true }] },
    put: { tags: ['GroupMembers'], summary: 'Päivitä jäsen', security: [{ bearerAuth: [] }], parameters: [{ name: 'member_id', in: 'path', required: true }] },
    delete: { tags: ['GroupMembers'], summary: 'Poista jäsen', security: [{ bearerAuth: [] }], parameters: [{ name: 'member_id', in: 'path', required: true }] }
  },
  '/group_messages': {
    get: { tags: ['GroupMessages'], summary: 'Listaa viestit' },
    post: { tags: ['GroupMessages'], summary: 'Lisää viesti', security: [{ bearerAuth: [] }] }
  },
  '/group_messages/{message_id}': {
    get: { tags: ['GroupMessages'], summary: 'Hae viesti', parameters: [{ name: 'message_id', in: 'path', required: true }] },
    put: { tags: ['GroupMessages'], summary: 'Päivitä viesti', security: [{ bearerAuth: [] }], parameters: [{ name: 'message_id', in: 'path', required: true }] },
    delete: { tags: ['GroupMessages'], summary: 'Poista viesti', security: [{ bearerAuth: [] }], parameters: [{ name: 'message_id', in: 'path', required: true }] }
  },
  '/group_movies': {
    get: { tags: ['GroupMovies'], summary: 'Listaa ryhmän elokuvat (query group_id)' },
    post: { tags: ['GroupMovies'], summary: 'Lisää elokuva ryhmään', security: [{ bearerAuth: [] }] }
  },
  '/group_movies/{group_id}': {
    get: { tags: ['GroupMovies'], summary: 'Hae ryhmän elokuvat', parameters: [{ name: 'group_id', in: 'path', required: true }] }
  },
  '/group_movies/{group_movie_id}': {
    delete: { tags: ['GroupMovies'], summary: 'Poista ryhmän elokuva', security: [{ bearerAuth: [] }], parameters: [{ name: 'group_movie_id', in: 'path', required: true }] }
  },
  '/upload/user/{id}/profile_picture': {
    post: { tags: ['Upload'], summary: 'Lataa profiilikuva', parameters: [{ name: 'id', in: 'path', required: true }], requestBody: { required: true }, responses: { 200: { description: 'URL palautettu' } } }
  },
  '/group/search': {
    get: {
      tags: ['Groups'],
      summary: 'Etsi ryhmiä',
      parameters: [ { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Hakuteksti' } ],
      responses: { 200: { description: 'Ryhmälista' } }
    }
  },
  '/group': {
    get: {
      tags: ['Groups'],
      summary: 'Listaa ryhmät',
      responses: { 200: { description: 'Ryhmälista' } }
    },
    post: {
      tags: ['Groups'],
      summary: 'Luo ryhmä',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Ryhmä luotu' }, 401: { description: 'Kirjautuminen vaaditaan' } }
    }
  },
  '/favorites': {
    get: {
      tags: ['Favorites'],
      summary: 'Listaa suosikit',
      responses: { 200: { description: 'Suosikit lista' } }
    },
    post: {
      tags: ['Favorites'],
      summary: 'Lisää suosikki',
      requestBody: { required: true },
      responses: { 201: { description: 'Lisätty' } }
    }
  },
  '/reviews': {
    get: {
      tags: ['Reviews'],
      summary: 'Listaa arvostelut',
      responses: { 200: { description: 'Arvostelulista' } }
    },
    post: {
      tags: ['Reviews'],
      summary: 'Lisää arvostelu',
      requestBody: { required: true },
      responses: { 201: { description: 'Lisätty' } }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  definition: { ...swaggerDefinition, paths },
  apis: [] // We provide paths programmatically; add files here if you later annotate routes.
});

export default swaggerSpec;
