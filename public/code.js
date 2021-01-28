  // normally you would never want to reveal your API keys,
  // however Firebase has controls on its own side
  const firebaseConfig = {
    apiKey: "AIzaSyD2HKfLRDyymbhooUYm_bxsb5NuyIiNkjM",
    authDomain: "agentsoil.firebaseapp.com",
    databaseURL: "https://agentsoil.firebaseio.com",
    projectId: "agentsoil",
    storageBucket: "agentsoil.appspot.com",
    messagingSenderId: "1020485932484",
    appId: "1:1020485932484:web:2089c687107633bc370091",
    measurementId: "G-GTRZ344TH6"
  };
  // initates connection using above credentials
  firebase.initializeApp(firebaseConfig);
  // specify that we want the database library of firebase
  var database = firebase.database();
  // specify that we want the authentication library also
  var auth = firebase.auth();

  // start with the function to add new messages
  function sendMessage(data) {
    // push a new message into firebase
    var newMessKey = firebase
                      // access the database
                        .database()
                          // get the root of the database
                          .ref()
                            // go to the messages area
                            .child('messages')
                            // push an empty new message
                          .push()
                          // get the key so we can update it
                        .key;
     // get the timestamp, this asks the server to fill in a timestamp
    data.time = firebase.database.ServerValue.TIMESTAMP
    // get the userID of the currently authorised user
    data.uid = auth.currentUser.uid
    // create an empty array for the new data
    var updates = {};
    // add the data passed in, specifically username and mesage
    updates['/messages/' + newMessKey] = data;
    // update the users section with the last post
    updates['/users/' + data.uid] = {lastPost:data.time}
    // try to update, and if it fails then log the error
    return database
            .ref()
            .update(updates,
               (err) => console.log(err) )
   
  }

  function readMessages() {
    // get to the messages directory
    database.ref('/messages/')
      // when something is added to the list of messages,
      // get the data from it
      .on('child_added', function(data) {
        // from the data given, get the following fields
        const {username,message,time,uid} = data.val()
        // turn the timestamp into a Javascript Date
        let localTime = new Date(time)
        // turn the JS date into a local time string
        let clientTimestamp = localTime
          // Locale time string uses the local format
          .toLocaleTimeString(
            // we only really want hour and minute
            {hour: "numeric",minute:"numeric"})
            // so cut the first part
              .slice(0,5)
              // add a new div to the page with the message key as ID
              addDiv(`${data.key}`, 
                // attach it to the chat container
                'chat',
                // make the actual message, using username, timestamp
                // and message with some styling
                `${username} <small style="color:grey;">[${
                  clientTimestamp}]</small> : ${message}`)
          });
      // set it up so that if the message is removed, it is 
      // removed for everyone without needing a refresh
    database.ref('/messages/')
            .on('child_removed', function(data) {
          // find the divider with the key of the deleted item
          let toDelete = document
          // use query selector to find it
            .querySelector('#'+data.key);
            // probably want to console.log this 
              console.log("deleting "+toDelete.id)
          // to remove the item
          toDelete
            // tell the parent
            .parentNode
              // to pull an Abraham
              .removeChild(toDelete);
      });
  };

  // code to create a Div and add it at a certain point
  function addDiv(id, mountpoint,message) {
    // create element on the page
    let newDiv = document
                  .createElement('div')
    // set the HTML inside to that of 'message'
    newDiv.innerHTML = message
    // set the ID of the Div to ID
    newDiv.id = id
    document
      // find the mountpoint on the page
      .querySelector(`#${mountpoint}`)
        // add the divider as a child
        .appendChild(newDiv)
    return newDiv
  }

  // These could probably be combined into a generic function, but
  // here I have a separate function for a Form
  function addForm(id,mountpoint) {
    let newForm = document
                    .createElement('form')
    newForm.id = id;
    // add a form
    document
      .querySelector(`#${mountpoint}`)
        .appendChild(newForm);
    return newForm
  }

  // Similarly there's an add input function, designed to be used 
  // with the Form
  function addInput(id, mountpoint, prompt) {
    let newInput = document.createElement('input')
    newInput.id=id
    newInput.placeholder = prompt
    // add an input box
    document
      .querySelector(`#${mountpoint}`)
        .appendChild(newInput)
  }

  // There's also a button adder function
  function addButton(id, mountpoint, text, onclick) {
    let newButton = document.createElement('button')
    newButton.id = id;
    newButton.innerText = text;
    newButton.onclick = onclick;
    document.querySelector(`#${mountpoint}`).appendChild(
        newButton
    )
  }

  function showVibes(user) {
      console.log(user)
      const uId = user.uid
      let date = ((new Date).toLocaleDateString('en-GB').replaceAll('/','-'))

      addDiv('posi','moodContainer',"😎")
      addDiv('negi','moodContainer',"😰")
      
      const posi = document.querySelector('#posi')
      const negi = document.querySelector('#negi')
      posi.onclick = () => vibeCheck(uId,'posi')
      posi.style.backgroundColor = "green"
      negi.onclick = () => vibeCheck(uId,'negi')
      negi.style.backgroundColor = "red"

      database.ref(`/users/${uId}/vibes/${date}/last`)
      // when something is added to the list of messages,
      // get the data from it
      .on('value', function(data) {
         let last = (data.val())

        for (node of document.querySelector('#moodContainer').childNodes)

        { 
          console.log(node)
          node.style.opacity = "0.2"} 
        document.querySelector(`#${last}`).style.opacity = "1.0"
      }
      )
    //   updates['/users/' + data.uid] = {lastPost:data.time}
    // // try to update, and if it fails then log the error
    // return database
    //         .ref()
    //         .update(updates,
    //            (err) => console.log(err) )
  }

function vibeCheck(uId,sentiment) {
  let date = ((new Date).toLocaleDateString('en-GB').replaceAll('/','-'))
  let time = ((new Date).toLocaleTimeString('en-GB'))
  database.ref(`/users/${uId}/vibes/${date}`).update({[time]:sentiment, last:sentiment})
 // database.ref(`/users/${uId}/`).update({admin:"false"})
 
}

//This was a test function to stop listening to database changes
// addButton('stopListen','sendMessage','StopListening ',(e)=>{
//     database
//       .ref('/messages/')
//         .off()
//     e.preventDefault()
// })

// This sets up a new authentication provider
var provider = new firebase.auth.GoogleAuthProvider();

// This is the signin function
  function signIn() {
    // Get the auth library of firebase
    firebase
      .auth()
      // Uses the builtin signup function
        .signInWithPopup(provider)
          // sets user to the result and log their email
          .then(function(result) {
            var user = result.user;
            console.log(user.email) 
          })
        // catch any errors and log them  
      .catch((err)=>console.log(err));
  }
  // Signout function signs you out
  function signOut() {
    firebase
      .auth()
        .signOut()
          .then(function() {
            console.log('Signed out!')
          })
        .catch((err)=>console.log(err))
      // close the listener for the messages
    database.ref('/messages/').off()
  }

// This is the main function to build the page
firebase
  .auth()
    // If the authentication state changes, build or unbuild the page
    .onAuthStateChanged(function(user) {
      if (user) {
        // Read the messages and add them to the top
        // Will take a few seconds so fine to do this first
        readMessages();
        // Find the container and empty it out
        document
          .querySelector('#chatContainer')
            .innerHTML=""
        // adds the chat div where the messages will sit
        addDiv('chat','chatContainer',"")
        // adds the send message form
        addForm('sendMessage','chatContainer')
        // add input box which will be automatically filled in
        addInput('username','sendMessage','username')
        // add message box which will accessible
        addInput('message','sendMessage','message')
        // find the unsername box
        let username = document
                        .querySelector('#username')
        // set the username box equal to the first part of the email
        username.value = user.email.split('@')[0]
        // disable the box so it can't be altered
        username.disabled = true;
        // add the send message button
        addButton('sendButton','sendMessage','Send',(e)=>{
          // build an empty message object
          let newMessage = {}
          // add the username input box to the message
          newMessage
            .username = document.querySelector('#username').value
          // add the message itself
          newMessage
            .message = document.querySelector('#message').value
          // blank the message input box, ready for the next message
          document.querySelector('#message').value = ""
          // uses the above send message function with the data
          sendMessage(newMessage)
          // avoids the default behaviour, which is to refresh the page
          e.preventDefault()
        }) 
        addButton('signOut',
                    'sendMessage',
                      'Sign Out',
                        (e)=>{
          // calls the signout function
          signOut();
          // prevents the default behaviour
          e.preventDefault()
          })
          document
          .querySelector('#moodContainer')
            .innerHTML=""
          // fun stuff for vibe check
          showVibes(user)
          } 
      // If we're not logged in, create the login page

      else {
        // Scrap the chat container
        document
          .querySelector('#chatContainer')
            .innerHTML=""
        // Add a basic message in the upper container
          document
          .querySelector('#moodContainer')
            .innerHTML="Welcome to Ada Vibe Check System 1.0" 
          // If we sign out, just create the single signon button
        addButton('signIn',
                    'chatContainer','Login with Google',
                      (e)=>{
                        signIn();
                       // no default behaviour
                        e.preventDefault()
                      })
    }
  });