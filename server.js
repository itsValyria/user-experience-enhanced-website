// Importeer de vereiste modules
import express from "express";
import fetchJson from "./helpers/fetch-json.js";
import slugify from "slugify";

// Definieer de basis-URL voor API-verzoeken
const baseUrl = "https://fdnd-agency.directus.app";

// Maak een nieuwe express-app aan
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Haal gegevens op van de FDND Agency API met de basis-URL
const fetchFromApi = async (endpoint) => {
  const response = await fetchJson(baseUrl + endpoint);
  return response.data;
};

// Haal de gegevens van de FDND Agency API op
const fetchData = async () => {
  const allDataAdvertisements = await fetchFromApi("/items/dh_services");
  return allDataAdvertisements;
};

// Definieer routes nadat de gegevens zijn opgehaald
(async () => {
  let allAdvertisementsData = await fetchData();
  let idCounter = allAdvertisementsData.length;

  app.set("view engine", "ejs");
  app.set("views", "./views");
  app.use(express.static("public"));

  // GET-route voor de startpagina
  app.get("/", function (request, response) {
    response.render("index", { services: allAdvertisementsData });
  });

  // GET-route voor de overzichtspagina
  app.get("/overzicht", function (request, response) {
    response.render("overzicht", { services: allAdvertisementsData });
  });

  // GET-route voor het weergeven van de service datail page met slug
  app.get("/service/:slug", function (request, response) {
    const serviceSlug = request.params.slug;
    const service = allAdvertisementsData.find(
      (service) => service.slug === serviceSlug
    );
    if (!service) {
      console.error(`Service met slug ${serviceSlug} niet gevonden`);
      response.status(404).send("Service niet gevonden");
      return;
    }
    response.render("service", { service: service });
  });

  // Zorg voor een leesbare URL door de titel weer te geven in plaats van het ID
  allAdvertisementsData.forEach((service) => {
    service.slug = slugify(service.title, { lower: true });
  });

  // GET-route voor de pagina service aanmelden
  app.get("/service-aanmelden", function (request, response) {
    response.render("service-aanmelden", { services: allAdvertisementsData });
  });

  // GET-route voor de pagina service aanmelden succes
  app.get("/service-aanmelden-gelukt", function (request, response) {
    response.render("service-aanmelden-gelukt", {
      services: allAdvertisementsData,
    });
  });

  // POST-route om formulier gegevens te verwerken
  app.post("/service-aanmelden", async function (request, response) {
    try {
      const formData = request.body;

      // Construct the data to be sent to the API
      const newAdvertisement = {
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

      // Post data naar de API endpoint
      const responseFromAPI = await fetchJson(baseUrl + "/items/dh_services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdvertisement),
      });

      // Feedback van de API
      console.log("Response from API:", responseFromAPI);

      // Fetch updated data from the API
      allAdvertisementsData = await fetchData();

      // Redirect naar de succes pagina
      response.redirect("/service-aanmelden-gelukt");
    } catch (error) {
      console.error("Error while posting data to API:", error);
      // Handle de error response hier!
      response.status(500).send("Internal Server Error");
    }
  });

  // POST-route voor het liken van een service
  app.post("/like", async function (request, response) {
    const { like_id } = request.body;
    console.log("Like verzoek voor service met ID:", like_id);
    const service = allAdvertisementsData.find(
      (service) => service.id === parseInt(like_id)
    );
    if (service) {
      // Up het aantal likes voor de service
      service.likes = (service.likes || 0) + 1;
      // Update het aantal likes in de Directus API
      try {
        await fetchJson(baseUrl + `/items/dh_services/${like_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ likes: service.likes }),
        });
      } catch (error) {
        console.error(
          "Fout bij het patchen van het aantal likes in de Directus API:",
          error
        );
        // Hier kun je een fout behandelen voor de user.
      }
      //Laat het weten als het liken succesvol is.
      console.log("Aantal likes bijgewerkt voor service:", service); // Log het bijgewerkte service object
    } else {
      // Laat het weten als de service niet gevonden is.
      console.log("Service niet gevonden voor ID:", like_id);
      response.status(404).send("Service niet gevonden");
    }
  });

  // Stel het poortnummer in waar express op moet gaan luisteren
  app.set("port", process.env.PORT || 8000);

  // Start op en laat de gebruikte poort zien
  app.listen(app.get("port"), function () {
    console.log(`Applicatie gestart op http://localhost:${app.get("port")}`);
  });
})();
