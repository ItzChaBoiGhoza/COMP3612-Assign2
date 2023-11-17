const api = 'http://www.randyconnolly.com/funwebdev/3rd/api/music';

function fetchDataApi(endpoint, filter = {}) { // Source for this function is from stack overflow
   const url = new URL(`${api}/${endpoint}`);

   // Append filter parameters to the URL
   Object.entries(filter).forEach(([key, value]) => {
      url.searchParams.append(key, value);
   });

   return fetch(url)
      .then(function(response) {
         if (!response.ok) {
            throw new Error(`HTTP error! Error Status: ${response.status}`);
         }
         return response.json();
      });
}

function displayContent(container, title, data) {
   container.innerHTML = `<h3>${title}</h3>`;
   data.slice(0, 10).forEach(function(item) {
      const itemElement = document.createElement('p');
      itemElement.textContent = item.name || item.title;
      container.appendChild(itemElement);
   });
}

function populateArtistOptions() {
   const artistSelection = document.querySelector('#artistSelection');

   fetchDataApi('artists.php')
   .then(function (artistsData) {
       artistSelection.innerHTML = '<option value="">Pick One</option>';

       artistsData.forEach(function (artist) {
           const optionElement = document.createElement('option');
           optionElement.value = artist.name; 
           optionElement.textContent = artist.name; 
           artistSelection.appendChild(optionElement);
       });
   })
   .catch(function (error) {
       console.error('Error fetching artists:', error);
   });
}

function populateGenreOptions() {
   const genreSelection = document.querySelector('#genreSelection');

   fetchDataApi('genres.php')
      .then(function (genresData) {
         genreSelection.innerHTML = '<option value="">Pick One</option>';

         genresData.forEach(function (genre) {
            const optionElement = document.createElement('option');
            optionElement.value = genre.name;
            optionElement.textContent = genre.name;
            genreSelection.appendChild(optionElement);
         });
      })
      .catch(function (error) {
         console.error('Error fetching genres:', error);
      });
}

function homeViewSetup() {
   const topGenreView = document.querySelector('#home .home-column:nth-child(1)');
   const topArtistView = document.querySelector('#home .home-column:nth-child(2)');
   const mostPopularSongView = document.querySelector('#home .home-column:nth-child(3)');

   fetchDataApi('genres.php')
      .then(function(topGenreData) {
         displayContent(topGenreView, 'Top 10 Genres', topGenreData);

         return fetchDataApi('artists.php');
      })
      .then(function(topArtistData) {
         displayContent(topArtistView, 'Top 10 Artists', topArtistData);

         return fetchDataApi('songs.php');
      })
      .then(function(popularSongsData) {
         displayContent(mostPopularSongView, '10 Most Popular Songs', popularSongsData);
      })
      .catch(function error() {
         console.log(error);
      });
}

function searchViewSetup() {
   const filterForm = document.querySelector('#filter-song');
   const searchResultsContainer = document.querySelector('#searchResults');

   function resetSearchResults() {
      searchResultsContainer.innerHTML = '';
   }

   filterForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevents the default form submission behavior

      const clickedButton = event.submitter.id;
      
      if (clickedButton === 'filterButton') {
         fetchDataApi('songs.php')
         .then(function (allSongsData) {
            const filterCriteria = document.querySelector('input[name="filterCriteria"]:checked').id;
            const inputValue = document.querySelector('#titleInput').value;

            let filteredSongs = allSongsData;

            if (filterCriteria === 'artist') {
               // Filter by selected artist
               const selectedArtist = document.querySelector('#artistSelection').value;
               filteredSongs = allSongsData.filter(song => song.artist_name === selectedArtist);
            } else if (filterCriteria === 'genre') {
               // Filter by selected genre
               const selectedGenre = document.querySelector('#genreSelection').value;
               filteredSongs = allSongsData.filter(song => song.genre_name === selectedGenre);
            } else {
               // Default filter by input value, which is filter through title
               filteredSongs = allSongsData.filter(song => {
                  const valueToCheck = song[filterCriteria.toLowerCase()];
                  return valueToCheck && valueToCheck.toLowerCase().includes(inputValue.toLowerCase());
               });
            }

            // Clear existing results
            searchResultsContainer.innerHTML = '';

            // Display new search results
            displaySearchResults(searchResultsContainer, filteredSongs);
         })
         .catch(function (error) {
            console.error('Error fetching search results:', error);
         });
      } 
   });

   // Clear button event listener
   const clearButton = document.querySelector('input[type="reset"]');
   clearButton.addEventListener('click', function() {
      // Clear the input field
      document.querySelector('#titleInput').value = '';

      // Clear existing results
      searchResultsContainer.innerHTML = '';

      // Clear the search results
      resetSearchResults();
   });

   // Populate artist and genre options
   populateArtistOptions();
   populateGenreOptions();
}

function displaySearchResults(container, searchResultsData) {
   // Clear existing results
   container.innerHTML = '';

   // Create table elements
   const table = document.createElement('table');
   table.style.width = '100%';

   // Create table header
   const thead = document.createElement('thead');
   const headerRow = document.createElement('tr');
   ['Title', 'Artist', 'Year', 'Genre'].forEach(function (headerText) {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
   });
   thead.appendChild(headerRow);
   table.appendChild(thead);

   // Create table body
   const tbody = document.createElement('tbody');
   searchResultsData.forEach(function (song) {
      const tr = document.createElement('tr');

      // Append table data for each column
      ['title', 'artist_name', 'year', 'genre_name'].forEach(function (columnName) {
         const td = document.createElement('td');

         // Check if it's the title column
         if (columnName === 'title') {
            // Create a link element
            const titleLink = document.createElement('a');
            titleLink.href = '#'; // Update this with the link to Single Song View
            titleLink.textContent = song[columnName];
            
            // Add an event listener to handle the click and display Single Song View
            titleLink.addEventListener('click', function () {
               singleSongView(song);
               showSingleSongView();
            });

            // Append the link element to the table data
            td.appendChild(titleLink);
         } else {
            // For other columns, simply set the text content
            td.textContent = song[columnName];
         }

         // Append the table data to the table row
         tr.appendChild(td);
      });

      // Append the table row to the table body
      tbody.appendChild(tr);
   });
   table.appendChild(tbody);

   // Append the table to the container
   container.appendChild(table);
}

function singleSongView(song) {
   hideSearchView();
   document.querySelector('#song-title').textContent = `${song.title}`;
   document.querySelector('#song-artist').textContent = `${song.artist_name}`;
   document.querySelector('#song-genre').textContent = `${song.genre_name}`;
   document.querySelector('#song-year').textContent = `${song.year}`;
   document.querySelector('#song-duration').textContent = `${songDurationFormat(song.duration)}`;

   const analysisList = document.querySelector('#analysis-list');

   analysisList.innerHTML = `
      <li>BPM: ${song.bpm} ${songTempoMean(song)}</li>
      <li>Energy: ${song.energy} out of 100</li>
      <li>Danceability: ${song.danceability} out of 100</li>
      <li>Valence: ${song.valence} out of 100</li>
      <li>Liveness: ${song.liveness} out of 100</li>
      <li>Acousticness: ${song.acousticness} out of 100</li>
      <li>Speechiness: ${song.speechiness} out of 100</li>
      <li>Popularity: ${song.popularity}</li>
   `;

   const chartContainer = document.querySelector('.song-radar-chart-column');
   chartContainer.innerHTML = '';

   songRadarChart(chartContainer, song);
}

function songTempoMean(song) {
   if(song.bpm >= 169) {
      return '(Very Fast Tempo)';
   } else if(song.bpm >= 121) {
      return '(Fast Tempo)'
   } else if(song.bpm >= 77) {
      return '(Medium Tempo)'
   } else {
      return '(Slow Tempo)'
   }
}

function songDurationFormat(durationInSeconds) {
   const minutes = Math.floor(durationInSeconds / 60);
   const seconds = durationInSeconds % 60;

   return `${minutes}m ${seconds}s`;
}

function songRadarChart(container, song) {
   const chartContainer = document.createElement('div');
   chartContainer.className = 'song-radar-chart-column';
   chartContainer.innerHTML = '<canvas id="radar-chart"></canvas>';
   container.appendChild(chartContainer);

   const chartCanvas = chartContainer.querySelector('#radar-chart');
   chartCanvas.setAttribute('width', 50);
   chartCanvas.setAttribute('height', 50);
   const chartCtx = chartCanvas.getContext('2d');

   const chartData = {
      labels: ['Danceability', 'Energy', 'Valence', 'Liveness', 'Speechiness', 'Acousticness'],
      datasets: [{
         label: 'Radar Chart',
         backgroundColor: 'rgba(75,192,192,0.2)',
         borderColor: 'rgba(75,192,192,1)',
         data: [
            song.danceability,
            song.energy,
            song.valence, 
            song.liveness,
            song.speechiness,
            song.acousticness
         ]
      }]
   };

   const chartOptions = {
      scale: {
         ticks: {beginAtZero: true, max: 100},
         pointLabels: {fontsize: 14}
      }
   };

   new Chart(chartCtx, {
      type: 'radar',
      data: chartData,
      options: chartOptions
   });
}

document.addEventListener('DOMContentLoaded', function() {
   homeViewSetup();

   document.querySelector('#search-link').addEventListener('click', function() {
      hideHomeView();
      showSearchView();
   })

   document.querySelector('#home-link').addEventListener('click', function() {
      showHomeView();
      hideSearchView();
   })

   document.querySelector('#back-button').addEventListener('click', function() {
      hideSingleSongView();
      showSearchView();
      document.querySelector('#searchResults').innerHTML = '';
   })
});

function showSingleSongView() {
   const singleSongView = document.querySelector('#single-song');
   singleSongView.style.display = 'flex';
}

function hideSingleSongView() {
   const singleSongView = document.querySelector('#single-song');
   singleSongView.style.display = 'none';
}

function showHomeView() {
   const homeView = document.querySelector('#home');
   homeView.style.display = 'flex';
}

function hideHomeView() {
   const homeView = document.querySelector('#home');
   homeView.style.display = 'none';
}

function showSearchView() {
   const searchView = document.querySelector('#search');
   searchView.style.display = 'flex';

   searchViewSetup();
}

function hideSearchView() {
   const searchView = document.querySelector('#search');
   searchView.style.display = 'none'
}