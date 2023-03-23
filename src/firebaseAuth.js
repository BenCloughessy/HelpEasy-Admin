import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseApp from "./firebaseConfig";
import { useState, useEffect} from "react";
import Home from "./Home";

// Login Screen
const FirebaseAuth = () => {
    const [user, setUser] = useState({})
    const [admin, setAdmin] = useState(false)
    
    // allowed emails
    const allowedEmails = [
        "cloughessybenjamin@gmail.com"
    ]

    const provider = new GoogleAuthProvider();

    const signInWithGoogle = async () => {
        const auth = getAuth(firebaseApp);

        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            setUser(user)
            // IdP data available using getAdditionalUserInfo(result)
            // ...
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
          });
    }

    const verifyUser = async () => {
        if (user.emailVerified && allowedEmails.includes(user.email)) {
            setAdmin(true)
        }
    }

    useEffect(() => {
        verifyUser()
    }, [user])

        if(admin) {
            return (
                <Home />
            )
        } else {
            return (
            <div>
                <button onClick={signInWithGoogle}>Sign in with Google</button>
            </div>
            )
            
        }
  };
  
  export default FirebaseAuth;
  