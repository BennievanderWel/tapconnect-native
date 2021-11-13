import * as React from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";

const Input = () => {
  const [value, setValue] = React.useState("");

  return (
    <View>
      <TextInput
        placeholder='Type hier je bericht..'
        style={styles.input}
        value={value}
        onChangeText={setValue}
      />
      <Button title='Verstuur' color='#00d1b2' />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 52,
    paddingLeft: 12,
    borderWidth: 2,
    borderColor: "#00d1b2",
    fontSize: 18,
  },
});

export default Input;
