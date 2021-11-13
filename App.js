import * as React from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import firebase from "firebase/app";
import firebaseConfig from "./config/firebase";
import {
  getChatsForUser,
  logoutUser,
  startListeningToLoggedInUserChanges,
} from "./api";

import LoginScreen from "./screens/Login";
import ChatListScreen from "./screens/ChatList";
import SplashScreen from "./screens/Splash";
import ChatScreen from "./screens/Chat";

import AppContext from "./AppContext";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const Stack = createStackNavigator();

function App() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [chats, setChats] = React.useState({});

  React.useEffect(() => {
    const updateState = (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthenticated(true);
        setLoading(false);
      } else {
        setCurrentUser(null);
        setAuthenticated(false);
        setLoading(false);
      }
    };

    // TODO: Handle unhappy path
    startListeningToLoggedInUserChanges(updateState);
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      const setNewChats = (newChats) => setChats({ ...newChats });
      getChatsForUser(currentUser.uid, setNewChats);
    }
  }, [currentUser]);

  return (
    <AppContext.Provider value={{ chats, currentUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {loading && !authenticated && (
            <Stack.Screen name='Splash' component={SplashScreen} />
          )}
          {authenticated ? (
            <>
              <Stack.Screen
                name='ChatList'
                component={ChatListScreen}
                options={{
                  title: "Chats",
                  headerRight: () => (
                    <Button title='Logout' onPress={() => logoutUser()} />
                  ),
                }}
              />
              <Stack.Screen
                name='Chat'
                component={ChatScreen}
                options={({ route }) => ({ title: route.params.chatName })}
              />
            </>
          ) : (
            <Stack.Screen
              name='Login'
              component={LoginScreen}
              options={{ title: "Login" }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
