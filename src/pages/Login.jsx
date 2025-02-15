import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/authentication/Auth';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { set, ref } from 'firebase/database';
import { database } from '../firebase'; // Assuming you have this initialized
import {Button, Select, Option } from "@material-tailwind/react";
import { v4 as uuidv4 } from 'uuid'; // for generating unique user ID
import {
  Input,
} from "@material-tailwind/react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = React.useState("author"); // Default role
  const navigate = useNavigate();
  const { login } = useAuth();
  const auth = getAuth();
console.log("auth:::", auth);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear any previous errors

    try {
      if (isRegistering) {
        // 1. Create User in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // 2. Update User Profile (displayName)
        await updateProfile(user, { displayName: displayName });

        // 3. Get the user id from the function and update the value inside of
        //   console.log(new Promise(() => {}));

         console.log("user:::", user);
        // 4. Add User to Realtime Database with the selected role
         const userId = uuidv4();
        await set(ref(database, `users/${userId}`), {
            email: user.email,
            displayName: displayName,
            role: selectedRole // Selected role from dropdown
        });

        // 5. Log in the user
        login({
            userId: user.uid,
            email: user.email,
            displayName: displayName,
            role: selectedRole // Store the selected role
        });

         if(selectedRole === "author"){
             navigate('/author/123'); // Redirect to editor page

         } else  if(selectedRole === "editor"){
           navigate('/editor/123'); // Redirect to editor page
         }
         else  if(selectedRole === "reviewer"){
           navigate('/reviewer/123'); // Redirect to editor page
         }
         else{
           navigate('/reader/123'); // Redirect to editor page
         }
      } else {
        // Sign In User
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        //Get user info from database
           const userRef = ref(database, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
               if (snapshot.exists()) {
                    const userData = snapshot.val();
                    // 5. Log in the user
                       login({
                            userId: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            role: userData.role // Store the selected role
                        });
                   if(userData.role === "author"){
                         navigate('/author/123'); // Redirect to editor page

                       } else  if(userData.role === "editor"){
                         navigate('/editor/123'); // Redirect to editor page
                       }
                       else  if(userData.role === "reviewer"){
                         navigate('/reviewer/123'); // Redirect to editor page
                       }
                       else{
                         navigate('/reader/123'); // Redirect to editor page
                       }
                } else {
                    console.log("No data available");

                }
            })
      }
    } catch (error) {
      setError(error.message);
       console.log("error", error);
    }
  };
  const  handlChage = (e)=>{
    console.log("role::::: ", e);
    setSelectedRole(e);

  }
  return (
        <div className="container mx-auto mt-10">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 border border-gray-200 shadow-md rounded-md">
                <h2 className="text-2xl font-semibold mb-6">{isRegistering ? 'Register' : 'Login'}</h2>

                {isRegistering && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">Display Name:</label>
                            <Input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>

                    </>
                )}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                {isRegistering && (
                    <>
                    <div className="flex flex-col gap-6">
                        <Select label="Select Version" onChange={(e) =>handlChage(e)} >
                            <Option value="author">author</Option>
                            <Option value = "editor">editor</Option>
                            <Option value = "reviewer">reviewer</Option>
                            <Option value = "reader">reader</Option>
                        </Select>
                    </div>

                </>
                )}

                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                <Button type="submit" variant="gradient" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    {isRegistering ? 'Register' : 'Sign In'}
                </Button>

                <Button
                    type="button" variant="text"
                    className="mt-4 text-blue-500 hover:text-blue-800 text-sm"
                    onClick={() => setIsRegistering(!isRegistering)}
                >
                    {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </Button>
            </form>
        </div>
    );
};

export default Login;