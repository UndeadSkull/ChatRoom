import './App.css';

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useEffect, useRef, useState } from 'react';

!firebase.apps.length ?
  firebase.initializeApp({
    apiKey: "AIzaSyB8hMoDfGmlgJ7FpDtUl6CPWdykbzwoO0w",
    authDomain: "chatapp-74c43.firebaseapp.com",
    projectId: "chatapp-74c43",
    storageBucket: "chatapp-74c43.appspot.com",
    messagingSenderId: "481534853536",
    appId: "1:481534853536:web:9be801d3c9a26fc33924c5"
  })
  : firebase.app()

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header className="App-header">
        <span>Chat App</span>
        <SignOut />

      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }
  return (
    <>
      <h1>Chat App</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
function ChatRoom() {

  const dummy = useRef()

  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limitToLast(25)

  const [messages] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault();
    e.target.value = ''
    const { uid, photoURL } = auth.currentUser

    formValue && await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
  }

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages])
  return (
    <>
      <main >
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit"><span className='submitBtnSpan'>💬</span></button>
      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='' />
      <p>{text}</p>
    </div>
  )
}


export default App;
