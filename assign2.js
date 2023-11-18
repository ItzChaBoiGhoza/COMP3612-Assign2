const api = 'http://www.randyconnolly.com/funwebdev/3rd/api/music';
let playlist = [];

//Fetching the data from the provided api
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

//Put content inside the select option for Artist name
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

//Put content inside the select option for Genre 
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

//---- Home View Configuration
function displayTopGenre(container, data) {
   const searchResultsContainer = document.querySelector('#searchResults');
   
   const genreCounts = [];

   data.forEach(function(song) {
      const genreName = song.genre_name;

      const genreExist = genreCounts.find(function(genre) {
         return genre.name === genreName;
      });

      if(genreExist) {
         genreExist.count++;
      } else {
         genreCounts.push({ name: genreName, count: 1});
      }
   });
   // console.log(genreCounts);

   const topGenres = genreCounts.sort((a, b) => b.count - a.count).slice(0, 15);

   container.innerHTML = '<h3>Top Genres</h3>';

   topGenres.forEach(function(genre) {
      const genreElement = document.createElement('p');

      const genreLink = document.createElement('a');
      genreLink.href = '#';
      genreLink.textContent = genre.name;
      genreElement.classList.add('song-attribute');
      genreLink.addEventListener('click', function() {
         const clickedGenre = data.filter(function(song) {
            return genre.name === song.genre_name;
         })

         hideHomeView();
         showSearchView();
         displaySearchResults(searchResultsContainer, clickedGenre);
      });
      genreElement.appendChild(genreLink);
      container.appendChild(genreElement);
   })
}

function displayTopArtist(container, data) {
   const searchResultsContainer = document.querySelector('#searchResults');

   container.innerHTML = '<h3>Top Artists</h3>';

   const artistCounts = [];

   data.forEach(function(song) {
      const artistName = song.artist_name;
      
      const artistExist = artistCounts.find(function(artist) {
         return artist.name === artistName;
      });

      if(artistExist) {
         artistExist.count++;
      } else {
         artistCounts.push({ name: artistName, count: 1});
      }
   });
   // console.log(artistCounts);

   const topArtists = artistCounts.sort((a, b) => b.count - a.count).slice(0, 15);

   // console.log(topArtists);
   topArtists.forEach(function(artist) {
      const artistElement = document.createElement('p');

      const artistLink = document.createElement('a');
      artistLink.href = '#';
      artistLink.textContent = artist.name;
      artistElement.classList.add('song-attribute');
      artistLink.addEventListener('click', function() {
         const clickedArtist = data.filter(function(song) {
            return artist.name === song.artist_name;
         })

         hideHomeView();
         showSearchView();
         displaySearchResults(searchResultsContainer, clickedArtist);
      });
      artistElement.appendChild(artistLink);
      container.appendChild(artistElement);
   })
}

function displayMostPopularSongs(container, data) {
   const popularSongs = data.sort((a, b) => b.popularity - a.popularity).slice(0, 15);

   container.innerHTML = '<h3>Most Popular Songs</h3>';

   popularSongs.forEach(function(song) {
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
      })
      .catch(function(err) {
         console.log(err);
      }) ;
}

//---- Search View Configuration
function searchViewSetup() {
   const filterForm = document.querySelector('#filter-song');
   const searchResultsContainer = document.querySelector('#searchResults');

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
         .catch(function (error) {
            console.error('Error fetching search results:', error);
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
   ['Title', 'Artist', 'Year', 'Genre', 'Add to Playlist'].forEach(function (headerText) {
      const resultSearchTh = document.createElement('th');
      resultSearchTh.textContent = headerText;
      resultSearchHeaderRow.appendChild(resultSearchTh);
   });
   resultSearchTableHead.appendChild(resultSearchHeaderRow);
   resultSearchTable.appendChild(resultSearchTableHead);

   const resultSearchTableBody = document.createElement('tbody');
   searchResultsData.forEach(function (song) {
      const resultSearchTr = document.createElement('tr');

      ['title', 'artist_name', 'year', 'genre_name'].forEach(function (columnName) {
         const resultSearchTd = document.createElement('td');

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

function addSongToPlayList(song) {
   if(!playlist.some(item => item.song_id === song.song_id)) {
      playlist.push(song);
      updatePlaylistView();
   } else {
      alert('Song is already in the Playlist');
   }
}

//---- Playlist View Configuration
function removeSongFromPlaylist(songId) {
   playlist = playlist.filter(song => song.song_id !== songId);
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

//---- Single Song View Configuration
function singleSongView(song) {
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

//---- DOM content loader
document.addEventListener('DOMContentLoaded', function() {
   homeViewSetup();

   document.querySelector('#credits-link').addEventListener('click', function() {
      const creditsView = document.querySelector('#credits-popup');
      if(creditsView.style.display === 'none') {
         creditsView.style.display = 'flex';
      } else {
         creditsView.style.display = 'none';
      }
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

//---- Supporting functions for DOM content loader
function showPlaylistView() {
   const playlistView = document.querySelector('#playlist');
   playlistView.style.display = 'block';
}

function hidePlaylistView() {
   const playlistView = document.querySelector('#playlist');
   playlistView.style.display = 'none';
}

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