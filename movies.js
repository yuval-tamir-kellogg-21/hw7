firebase.auth().onAuthStateChanged(async function(user) {

    if (user) {
        // Signed in
        let db = firebase.firestore()
        
        // Register user in firestore
        db.collection('users').doc(user.uid).set({
            name: user.displayName,
            email: user.email
          })

        // Signed in as
          document.querySelector('.signed-in-as').insertAdjacentHTML('beforeend', `
            <div class="text-white">Signed in as <b>${user.displayName}</b></div>
        `)

        // Sign out button
        document.querySelector('.sign-in-or-sign-out').innerHTML = `
            <button class="text-white-500 rounded p-1 bg-pink-500 sign-out">Sign Out</button>
            `
            document.querySelector('.sign-out').addEventListener('click', function(event) {
            // console.log('sign out clicked')
            firebase.auth().signOut()
            document.location.href = 'movies.html'
            })

        let apiKey = '2be4ae316103e214a4775ef9833e8ecd'
        let response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`)
        let json = await response.json()
        let movies = json.results
        // console.log(movies)
        
        for (let i=0; i<movies.length; i++) {
        let movie = movies[i]
        let docRef = await db.collection('watched').doc(`${movie.id}-${user.uid}`).get() // Show only user's selection
        let watchedMovie = docRef.data()
        let opacityClass = ''
        if (watchedMovie) {
            opacityClass = 'opacity-20'
        }
    
        document.querySelector('.movies').insertAdjacentHTML('beforeend', `
            <div class="w-1/5 p-4 movie-${movie.id} ${opacityClass}">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="w-full">
            <a href="#" class="watched-button block text-center text-white bg-green-500 mt-4 px-4 py-2 rounded">I've watched this!</a>
            </div>
        `)
    
        document.querySelector(`.movie-${movie.id}`).addEventListener('click', async function(event) {
            event.preventDefault()
            let movieElement = document.querySelector(`.movie-${movie.id}`)
            movieElement.classList.add('opacity-20')
            await db.collection('watched').doc(`${movie.id}-${user.uid}`).set({}) // Register user's selection of movie nly for user
        }) 
        }
    } else {
        // Not logged-in
    
        // Hide the dashboard when signed-out
        document.querySelector('.movies').classList.add('hidden')
    
        // Initializes FirebaseUI Auth
        let ui = new firebaseui.auth.AuthUI(firebase.auth())
    
        // FirebaseUI configuration
        let authUIConfig = {
          signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
          ],
          signInSuccessUrl: 'movies.html'
        }
    
        // Starts FirebaseUI Auth
        ui.start('.sign-in-or-sign-out', authUIConfig)
      }
  })
  
  // Goal:   Refactor the movies application from last week, so that it supports
  //         user login and each user can have their own watchlist.
  
  // Start:  Your starting point is one possible solution for last week's homework.
  
  // Step 1: Add your Firebase configuration to movies.html, along with the
  //         (provided) script tags for all necessary Firebase services – i.e. Firebase
  //         Auth, Firebase Cloud Firestore, and Firebase UI for Auth; also
  //         add the CSS file for FirebaseUI for Auth.
  // Step 2: Change the main event listener from DOMContentLoaded to 
  //         firebase.auth().onAuthStateChanged and include conditional logic 
  //         shows a login UI when signed, and the list of movies when signed
  //         in. Use the provided .sign-in-or-sign-out element to show the
  //         login UI. If a user is signed-in, display a message like "Signed 
  //         in as <name>" along with a link to "Sign out". Ensure that a document
  //         is set in the "users" collection for each user that signs in to 
  //         your application.
  // Step 3: Setting the TMDB movie ID as the document ID on your "watched" collection
  //         will no longer work. The document ID should now be a combination of the
  //         TMDB movie ID and the user ID indicating which user has watched. 
  //         This "composite" ID could simply be `${movieId}-${userId}`. This should 
  //         be set when the "I've watched" button on each movie is clicked. Likewise, 
  //         when the list of movies loads and is shown on the page, only the movies 
  //         watched by the currently logged-in user should be opaque.