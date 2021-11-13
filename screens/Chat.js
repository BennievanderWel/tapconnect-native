import * as React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Input from "./Input";
import AppContext from "../AppContext";

const ChatScreen = ({ navigation, route }) => {
  const { chatId } = route.params;
  const { chats, currentUser } = React.useContext(AppContext);
  const chat = chats[chatId];

  return (
    <View>
      <FlatList
        style={styles.list}
        data={chat.messages}
        inverted
        renderItem={({ item }) => {
          const combinedStyles = [styles.message];
          if (item.senderId !== currentUser.uid) {
            combinedStyles.push(styles.incomingMessage);
          }
          return (
            <Text key={item.id} style={combinedStyles}>
              {item.content}
            </Text>
          );
        }}
      />
      <Input />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    marginBottom: 32,
    height: "80%",
  },
  message: {
    fontSize: 18,
    textAlign: "left",
    borderWidth: 1,
    borderColor: "grey",
    marginTop: 10,
    marginLeft: 10,
    padding: 4,
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
  },
  incomingMessage: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0, 209, 178, 0.7)",
    borderWidth: 1,
    marginRight: 10,
  },
});

export default ChatScreen;
