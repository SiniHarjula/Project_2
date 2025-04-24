//Get references to DOM elements by IDs
const theatreSelect = document.getElementById("theatreSelect");
const movies = document.getElementById("movies");
const theatreInput = document.getElementById("theatreInput");
const searchButton = document.getElementById("searchButton");
const titleList = []; // Array for storing movie title. To avoid duplicates on the page

window.addEventListener("load", fetchData); // Fetch theatre list when the page loads
theatreSelect.addEventListener("change", fetchShows); // Fetch shows when the user changes the selected theatre

searchButton.addEventListener("click", () => { // Handle search button click
  const search = theatreInput.value.toLowerCase(); // Get search input in lowercase

  for (const option of theatreSelect.options) {  // Loop through theatre dropdown options 
    if (option.text.toLowerCase().includes(search)) { //Check if option text includes the user's input
      theatreSelect.value = option.value; // Set matching option as selected
      fetchShows(); // Fetch and display shows for the selected theatre
      return;
    }
  }
});

function fetchData(){ // Fetch theatre areas from Finnkino API
  fetch('https://www.finnkino.fi/xml/TheatreAreas/')
    .then(response => {
      return response.text(); // Convert response to text
    }).then(data => {
      const parser = new DOMParser(); // Parse the XML string into an actual XML document
      const xml = parser.parseFromString(data, 'text/xml');
      const theatres = xml.querySelectorAll("TheatreArea"); // Select all <TheatreArea> elements from the XML

      for (const theatre of theatres) { //Loopt through all theatres and add them to the dropdown
        const id = theatre.querySelector("ID").textContent;
        const name = theatre.querySelector("Name").textContent;
        const option = document.createElement("option");
        option.value = id;
        option.text = name;

        theatreSelect.add(option); // Add option to select element
      }
    })
    .catch(error => {
      console.error("Error in fetching theatre data", error); // Log error if fetch fails
    });
  }

  function fetchShows(){ //Fetch movie schedule for the selected theatre
    const theatreId = theatreSelect.value;

    movies.innerHTML = ""; // Clear previous movie cards and title list
    titleList.length = 0;

    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theatreId}`) // Fetch schedule XML from Finnkino API
    .then(response => {
      return response.text(); // Convert response to text
    }).then(data => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, 'text/xml');
      const shows = xml.querySelectorAll("Show");

      for (const show of shows){ //Loop through each movie show
        const title = show.querySelector("Title").textContent;
        const imageURL = show.querySelector("EventLargeImagePortrait").textContent;
        const genres = show.querySelector("Genres").textContent;
        const year = show.querySelector("ProductionYear").textContent;
        const duration = show.querySelector("LengthInMinutes").textContent;
        const language = show.querySelector("Name").textContent;
        
        if (!titleList.includes(title)) { // Only add unique movie titles. Avoids duplicants
          titleList.push(title);
          const card = createMovieCard(title, imageURL, genres, year, duration, language); // Create a card for the movie and add it to the page
          movies.appendChild(card);
        }
      }
    })
    .catch(error => {
      console.error("Error in fetching shows", error); //Log error if show fetching fails
    });
  }

  function createMovieCard(title, imageURL, genres, year, duration, language) { // Create and return a movie card element
    const card = document.createElement("div"); // Create container div with class movie-card
    card.classList.add("movie-card");
  
    //Set inner HTML with image and overlay info
    card.innerHTML = ` 
      <img src="${imageURL}" alt="${title}">
      <div class="overlay">
        <h3>${title}</h3>
        <p>${genres}</p>
        <p>${year} • ${duration} min • ${language}</p>
      </div>
    `;
  
    return card; // Return the complete card element
  }
