// Importeer het npm pakket express uit de node_modules map
import express from 'express';

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js';

// Importeer slugify
import slugify from 'slugify';

// Maak een nieuwe express app aan
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fetch de data van de FDND Agency API
const allData_advertisements = await fetchJson('https://fdnd-agency.directus.app/items/dh_services');
let all_advertisements_data = allData_advertisements.data;

// // Stel ejs in als template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'));

// Counter voor het ID van de services
let idCounter = all_advertisements_data.length;

// GET route voor de index
app.get('/', function (request, response) {
  response.render('index', { services: all_advertisements_data });
});

// GET route voor ze overzichts pagina
app.get('/overzicht', function (request, response) {
  response.render('overzicht', { services: all_advertisements_data });
});

// GET route for displaying the service page with specific service data based on slug
app.get('/service/:slug', function (request, response) {
  // Extract the service slug from the request parameters
  const serviceSlug = request.params.slug;

  // Find the service with the matching slug from the all_advertisements_data array
  const service = all_advertisements_data.find(service => service.slug === serviceSlug);

  // If the service with the given slug is not found, return a 404 error
  if (!service) {
    console.error(`Service with slug ${serviceSlug} not found`);
    response.status(404).send('Service not found');
    return;
  }

  // Render the service.ejs template and pass the found service data to it
  response.render('service', { service: service });
});

// Zorg ervoor dat de URL leesbaar is door de titel te weergeven in plaats van het ID
all_advertisements_data.forEach(service => {
  service.slug = slugify(service.title, { lower: true });
});

// GET route for the service aanmelden pagina
app.get('/service-aanmelden', function (request, response) {
  response.render('service-aanmelden', { services: all_advertisements_data });
});

// GET route voor de service aanmelden gelukt pagina
app.get('/service-aanmelden-gelukt', function (request, response) {
  response.render('service-aanmelden-gelukt', { services: all_advertisements_data });
});

// POST route om data van het formulier te handlen
app.post('/service-aanmelden', function (request, response) {
  const formData = request.body;

// Maak een nieuw object met formData
const newAdvertisement = {
  id: ++idCounter, // Verhoog de ID count
  name: formData.name,
  surname: formData.surname,
  email: formData.email,
  contact: formData.contact,
  title: formData.title,
  short_description: formData.short_description,
  long_description: formData.long_description,
  location: formData.location,
  neighbourhood: formData.neighbourhood,
  start_date: formData.start_date,
  end_date: formData.end_date,
  start_time: formData.start_time,
  end_time: formData.end_time,
};

// Genereer een slug voor de nieuwe advertentie
newAdvertisement.slug = slugify(formData.title, { lower: true });

// Push het nieuwe object naar het all_advertisements_data array
all_advertisements_data.push(newAdvertisement);

// Redirect naar de gelukt pagina
response.redirect('/service-aanmelden-gelukt');
});

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})