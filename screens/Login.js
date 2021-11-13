import * as React from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { loginUser } from "../api";

const LoginScreen = () => {
  const [email, setEmail] = React.useState("bennie@test.nl");
  const [password, setPassword] = React.useState("password");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    loginUser(email, password).catch(() => setIsLoading(false));
  };

  return (
    <View style={styles.view}>
      <TextInput
        styles={styles.textInput}
        defaultValue={email}
        editable={!isLoading}
        placeholder='Email'
        onChangeText={setEmail}
      />
      <TextInput
        styles={styles.textInput}
        defaultValue={password}
        editable={!isLoading}
        secureTextEntry={true}
        placeholder='Wachtwoord'
        onChangeText={setPassword}
      />
      <Button onPress={handleSubmit} disabled={isLoading} title='Inloggen' />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 50,
    color: "white",
  },
});

export default LoginScreen;
