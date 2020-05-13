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

  firebase.initializeApp(firebaseConfig);
  
  var database = firebase.database();
  var auth = firebase.auth();

  function sendMessage(data) {
    //var {username,message} = data;
    var newMessKey = firebase.database().ref().child('messages').push().key;
    data.time = firebase.database.ServerValue.TIMESTAMP
    data.uid = auth.currentUser.uid
    var updates = {};
    updates['/messages/' + newMessKey] = data;
    updates['/users/' + data.uid] = {lastPost:data.time}
    return database.ref().update(updates,(err)=>console.log(err))
   
  }

  function readMessages() {
    database.ref('/messages/').on('child_added', function(data) {
        const {username,message,time,uid} = data.val()
       let localTime = new Date(time)
       let clientTimestamp = localTime.toLocaleTimeString({hour: "numeric",minute:"numeric"}).slice(0,5)
        addDiv(`${data.key}`,'chat',`${username} <small style="color:grey;">[${clientTimestamp}]</small> : ${message}`)
      });
    database.ref('/messages/').on('child_removed', function(data) {
        let toDelete = document.querySelector('#'+data.key);
        console.log("deleting "+toDelete.id)
        toDelete.parentNode.removeChild(toDelete);
      });
  };

  function addDiv(id, mountpoint,message) {
    let newDiv = document.createElement('div')
    newDiv.innerHTML= message
    newDiv.id = id
    document.querySelector(`#${mountpoint}`).appendChild(
        newDiv
    )
  }

  function addForm(id,mountpoint) {
    let newForm = document.createElement('form')
    newForm.id = id;
    document.querySelector(`#${mountpoint}`).appendChild(
        newForm
    );
  }

function addInput(id, mountpoint, prompt) {
    let newInput = document.createElement('input')
    newInput.id=id
    newInput.placeholder = prompt
    document.querySelector(`#${mountpoint}`).appendChild(
        newInput
    )
    
}

function addButton(id, mountpoint, text, onclick) {
    let newButton = document.createElement('button')
    newButton.id = id;
    newButton.innerText= text;
    newButton.onclick= onclick;
    document.querySelector(`#${mountpoint}`).appendChild(
        newButton
    )
}

// addButton('stopListen','sendMessage','StopListening ',(e)=>{
//     database.ref('/posts/').off()
//     e.preventDefault()
// })

var provider = new firebase.auth.GoogleAuthProvider();
function signIn() {
firebase.auth().signInWithPopup(provider).then(function(result) {
    // var token = result.credential.accessToken;
    var user = result.user;
    console.log(user.email)
  }).catch((err)=>console.log(err));}

function signOut() {
 firebase.auth().signOut().then(function() {
   console.log('Signed out!')
  }).catch((err)=>console.log(err))
  database.ref('/posts/').off()
  
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        readMessages();
  document.querySelector('#container').innerHTML=""
  addDiv('chat','container',"")
  addForm('sendMessage','container')
  addInput('username','sendMessage','username')
  addInput('message','sendMessage','message')
  let username = document.querySelector('#username')
  username.value = user.email.split('@')[0]
  username.disabled = true;
  addButton('sendButton','sendMessage','Send',(e)=>{
      let newMessage = {}
      newMessage.username = document.querySelector('#username').value
      newMessage.message = document.querySelector('#message').value
      document.querySelector('#message').value = ""
      sendMessage(newMessage)
      e.preventDefault()
  }) 
  addButton('signOut','sendMessage','Sign Out',(e)=>{
    signOut();
    e.preventDefault()
    })} else {

  document.querySelector('#container').innerHTML=""
        addButton('signIn','container','Login with Google',(e)=>{
            signIn();
            e.preventDefault()
        })
    }
  });