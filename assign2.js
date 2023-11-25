const api = 'http://www.randyconnolly.com/funwebdev/3rd/api/music';

//Initializing empty array for keeping track of the added songs into the playlist
let playlist = [];

//HTML selectors 
const artistSelection = document.querySelector('#artistSelection');
const genreSelection = document.querySelector('#genreSelection');
const searchResultsContainer = document.querySelector('#searchResults');

//---- DOM content loader
document.addEventListener('DOMContentLoaded', function() {
   homeViewSetup();

   document.querySelector('#credits-link').addEventListener('mouseover', function() {
      const creditsView = document.querySelector('#credits-popup');
      creditsView.style.display = 'flex'
      clearTimeout(timer);
   })

   document.querySelector('#credits-link').addEventListener('mouseout', function() {
      timer = setTimeout(function() {
         document.querySelector('#credits-popup').style.display = 'none';
      }, 5000);
   }) 

   document.querySelector('#search-link').addEventListener('click', function() {
      hideHomeView();
      hidePlaylistView();
      showSearchView();
   })

   document.querySelector('#home-link').addEventListener('click', function() {
      showHomeView();
      hideSearchView();
      hidePlaylistView();
      hideSingleSongView();
   })

   document.querySelector('#back-search-button').addEventListener('click', function() {
      hideSingleSongView();
      showSearchView();
   })

   document.querySelector('#back-home-button').addEventListener('click', function() {
      showHomeView();
      hideSingleSongView();
   })

   document.querySelector('#playlist-link').addEventListener('click', function() {
      hideSearchView();
      hideHomeView();
      hideSingleSongView();
      showPlaylistView();
   })
});

//Fetching the data from the provided api 
//Source for this function is from stack overflow 
//https://stackoverflow.com/questions/60178380/add-params-to-url-with-javascript
function fetchDataApi(endpoint, filter = {}) {
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

//Function to populate the select options
function optionPopulate(select, optionData, defaultText = '') {
   select.innerHTML = `<option value="">${defaultText}</option>`;

   optionData.forEach(function(item) {
      const optionElement = document.createElement('option');
      optionElement.value = item.name;
      optionElement.textContent = item.name;
      select.appendChild(optionElement);
   })
}

//Put content inside the select option for Artist name
function populateArtistOptions() {
   fetchDataApi('artists.php') 
      .then(function(artistData) {
         optionPopulate(artistSelection, artistData, 'Pick One');
      })
      .catch(function(err) {
         console.log(err);
      });
}

//Put content inside the select option for Genre 
function populateGenreOptions() {
   fetchDataApi('genres.php')
      .then(function(genreData) {
         optionPopulate(genreSelection, genreData, 'Pick One');
      })
      .catch(function(err) {
         console.log(err);
      })
}

//---- Home View Functions
function topItemDisplay(container, data, title, itemKey, count) {
   const itemCounts = [];

   data.forEach(function(item) {
      // console.log(item);
      const itemName = item[itemKey];

      const itemExist = itemCounts.find(function(itemExisting) {
         return itemExisting.name === itemName;
      });

      if(itemExist) {
         itemExist.count++;
      } else {
         itemCounts.push({name: itemName, count: 1});
      }
   });

   //method to sort items based on their count frequency inside the array
   const topItems = itemCounts.sort((a, b) => count(b) - count(a)).slice(0, 15);

   container.innerHTML = `<h3>${title}</h3>`;

   topItems.forEach(function(item) {
      // console.log(item);
      const itemElement = document.createElement('p');

      const itemLink = document.createElement('a');
      itemLink.href = '#';
      itemLink.textContent = item.name;
      itemElement.classList.add('song-attribute');
      itemLink.addEventListener('click', function() {
         const clickedItems = data.filter(function(dataItem) {
            return item.name === dataItem[itemKey];
         });

         hideHomeView();
         showSearchView();
         displaySearchResults(searchResultsContainer, clickedItems);
      });

      itemElement.appendChild(itemLink);
      container.appendChild(itemElement);
   });
}

function displayTopGenre(container, data) {
   topItemDisplay(container, data, 'Top Genres', 'genre_name', (item) => item.count);
}

function displayTopArtist(container, data) {
   topItemDisplay(container, data, 'Top Artists', 'artist_name', (item) => item.count);
}

function displayMostPopularSongs(container, data) {
   //method to sort the most popular song based on their popularity
   const popularSongs = data.sort((a, b) => b.popularity - a.popularity).slice(0, 15);

   container.innerHTML = '<h3>Most Popular Songs</h3>';

   popularSongs.forEach(function(song) {
      // console.log(song);
      const creatingSongElement = document.createElement('p');
      const songLink = document.createElement('a');
      songLink.href = '#';
      songLink.textContent = song.title;
      creatingSongElement.classList.add('song-attribute');
      songLink.addEventListener('click', function() {
         singleSongView(song);
         showSingleSongView();
         hideHomeView();
      });

      creatingSongElement.appendChild(songLink);
      container.appendChild(creatingSongElement);
   });
}

function homeViewSetup() {
   const topGenreView = document.querySelector('#home .home-column:nth-child(1)');
   const topArtistView = document.querySelector('#home .home-column:nth-child(2)');
   const mostPopularSongView = document.querySelector('#home .home-column:nth-child(3)');

   fetchDataApi('songs.php')
      .then(function(songsData) {
         displayTopGenre(topGenreView, songsData);
         displayTopArtist(topArtistView, songsData);
         displayMostPopularSongs(mostPopularSongView, songsData);
         // console.log(songsData);
      })
      .catch(function(err) {
         console.log(err);
      }) ;
}

function showHomeView() {
   const homeView = document.querySelector('#home');
   homeView.style.display = 'flex';
}

function hideHomeView() {
   const homeView = document.querySelector('#home');
   homeView.style.display = 'none';
}

//---- Search View Functions
function searchViewSetup() {
   const filterForm = document.querySelector('#filter-song');
   const searchResultsContainer = document.querySelector('#searchResults');

   filterForm.addEventListener('submit', function (event) {
      const clickedButton = event.submitter.id;
      
      if (clickedButton === 'filterButton') {
         fetchDataApi('songs.php')
         .then(function(allSongsData) {
            // console.log(allSongsData);
            const filterCriteria = document.querySelector('input[name="filterCriteria"]:checked').id;
            const inputValue = document.querySelector('#titleInput').value;

            let filteredSongs = allSongsData;

            //If else statement to figure out which radio button is selected
            if (filterCriteria === 'artist') {
               const selectedArtist = document.querySelector('#artistSelection').value;
               filteredSongs = allSongsData.filter(song => song.artist_name === selectedArtist);
            } else if (filterCriteria === 'genre') {
               const selectedGenre = document.querySelector('#genreSelection').value;
               filteredSongs = allSongsData.filter(song => song.genre_name === selectedGenre);
            } else {
               filteredSongs = allSongsData.filter(song => {
                  const valueToCheck = song[filterCriteria.toLowerCase()];
                  return valueToCheck && valueToCheck.toLowerCase().includes(inputValue.toLowerCase());
               });
            }

            searchResultsContainer.innerHTML = '';

            displaySearchResults(searchResultsContainer, filteredSongs);
         })
         .catch(function(err) {
            console.log(err);
         });
      } 
   });

   const clearButton = document.querySelector('input[type="reset"]');
   clearButton.addEventListener('click', function() {
      document.querySelector('#titleInput').value = '';

   
      searchResultsContainer.innerHTML = '';
   });

   populateArtistOptions();
   populateGenreOptions();
}

function displaySearchResults(container, searchResultsData) {
   container.innerHTML = '';

   const resultSearchTable = document.createElement('table');
   resultSearchTable.style.width = '100%';

   const resultSearchTableHead = document.createElement('thead');
   const resultSearchHeaderRow = document.createElement('tr');
   ['Title', 'Artist', 'Year', 'Genre', 'Add to Playlist'].forEach(function(headerText) {
      const resultSearchTh = document.createElement('th');
      resultSearchTh.textContent = headerText;
      resultSearchHeaderRow.appendChild(resultSearchTh);
   });
   resultSearchTableHead.appendChild(resultSearchHeaderRow);
   resultSearchTable.appendChild(resultSearchTableHead);

   const resultSearchTableBody = document.createElement('tbody');
   searchResultsData.forEach(function(song) {
      // console.log(song);
      const resultSearchTr = document.createElement('tr');

      ['title', 'artist_name', 'year', 'genre_name'].forEach(function(columnName) {
         const resultSearchTd = document.createElement('td');

         //If statement to make the song title clickable
         if (columnName === 'title') {
            const titleLink = document.createElement('a');
            titleLink.href = '#'; 
            resultSearchTd.classList.add('song-attribute');
            titleLink.textContent = song[columnName];
            
            titleLink.addEventListener('click', function () {
               singleSongView(song);
               showSingleSongView();
            });

            resultSearchTd.appendChild(titleLink);
         } else {
            resultSearchTd.textContent = song[columnName];
         }

         resultSearchTr.appendChild(resultSearchTd);
      });

      const addSongTd = document.createElement('td');
      const addSongLink = document.createElement('a');
      
      addSongLink.href = '#';
      addSongLink.text = 'Add';
      addSongTd.classList.add('add-song-button');
      addSongLink.addEventListener('click', function() {
         addSongToPlayList(song);
      });

      addSongTd.appendChild(addSongLink);
      resultSearchTr.appendChild(addSongTd);

      resultSearchTableBody.appendChild(resultSearchTr);
   });
   resultSearchTable.appendChild(resultSearchTableBody);

   container.appendChild(resultSearchTable);
}

//Function to be able to add song into the playlist
function addSongToPlayList(song) {
   if(!playlist.some(function(item) {
      return item.song_id === song.song_id;
   })) {
      playlist.push(song);
      updatePlaylistView();
   } else {
      alert('Song is already in the Playlist');
   }
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

//---- Playlist View Functions
function removeSongFromPlaylist(songId) {
   playlist = playlist.filter(function(song) {
      return song.song_id !== songId;
   });

   updatePlaylistView();
}

const clearPlaylistButton = document.querySelector('.playlist-clear a');
clearPlaylistButton.addEventListener('click', function() {
   clearPlaylist();
});

function clearPlaylist() {
   playlist = [];
   updatePlaylistView();
   document.querySelector('.playlist-information p').textContent = `${playlist.length} songs, average popularity: 0`
}

function updatePlaylistView() {
   const playlistTableBody = document.querySelector('#playlist-view tbody');
   playlistTableBody.innerHTML = '';

   playlist.forEach(function(song) {
      const createTr = document.createElement('tr');
      ['title', 'artist_name', 'year', 'genre_name'].forEach(function(columnName) {
         const createTd = document.createElement('td');
         if(columnName === 'title') {
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            createTd.classList.add('song-attribute');
            titleLink.textContent = song[columnName];

            titleLink.addEventListener('click', function() {
               singleSongView(song);
               showSingleSongView();
            });
            createTd.appendChild(titleLink);
         } else {
            createTd.textContent = song[columnName];
         }

         createTr.appendChild(createTd);
      });

      const removeSongTd = document.createElement('td');
      const removeSong = document.createElement('a');
      removeSong.href = '#';
      removeSong.text = 'Remove';
      removeSongTd.classList.add('remove-song');
      removeSong.addEventListener('click', function() {
         removeSongFromPlaylist(song.song_id);
      });

      removeSongTd.appendChild(removeSong);
      createTr.appendChild(removeSongTd);

      playlistTableBody.appendChild(createTr);
   })

   const playlistInfo = document.querySelector('.playlist-information p');

   const avgPlaylistPopularity = calculatePopularity();

   playlistInfo.textContent = `${playlist.length} songs, average popularity: ${avgPlaylistPopularity.toFixed(0)}`;
}

function calculatePopularity() {
   const totalPopularity = playlist.reduce((sum, song) => sum + parseInt(song.popularity), 0);

   return totalPopularity / playlist.length;
}

function showPlaylistView() {
   const playlistView = document.querySelector('#playlist');
   playlistView.style.display = 'block';
}

function hidePlaylistView() {
   const playlistView = document.querySelector('#playlist');
   playlistView.style.display = 'none';
}

//---- Single Song View Configuration
function singleSongView(song) {
   // console.log(song);
   hideSearchView();
   hidePlaylistView();
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

//Function to show what the song's tempo means
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

//Function to show the song's duration in minutes and seconds; rather than showing it seconds only
//Got the idea from a stack overflow
//https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
function songDurationFormat(durationInSeconds) {
   const minutes = Math.floor(durationInSeconds / 60);
   const seconds = durationInSeconds % 60;

   return `${minutes}m ${seconds}s`;
}

//Function to display the song's attributes using radar chart
//Full Chart.js documentation on radar chart
//https://www.chartjs.org/docs/latest/charts/radar.html
function songRadarChart(container, song) {
   const chartContainer = document.createElement('div');
   chartContainer.className = 'song-radar-chart-column';
   chartContainer.innerHTML = '<canvas id="radar-chart"></canvas>';
   container.appendChild(chartContainer);

   const chartCanvas = chartContainer.querySelector('#radar-chart');
   chartCanvas.setAttribute('width', 50);
   chartCanvas.setAttribute('height', 50);
   const chartCtx = chartCanvas.getContext('2d');

   //https://stackoverflow.com/questions/47988873/chartjs-add-backgroundcolor-for-labels-radar-chart
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

   //https://www.chartjs.org/docs/latest/samples/scale-options/ticks.html
   const chartOptions = {
      scale: {
         ticks: {beginAtZero: true, max: 100},
         pointLabels: {fontsize: 14}
      }
   };

   //Controller for each dataset, introduced in Chart.js 2.0
   //https://www.chartjs.org/docs/latest/developers/charts.html
   new Chart(chartCtx, {
      type: 'radar',
      data: chartData,
      options: chartOptions
   });
}

function showSingleSongView() {
   const singleSongView = document.querySelector('#single-song');
   singleSongView.style.display = 'flex';
}

function hideSingleSongView() {
   const singleSongView = document.querySelector('#single-song');
   singleSongView.style.display = 'none';
}