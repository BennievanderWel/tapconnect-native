import * as React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getChatsForUser } from "../api";
import AppContext from "../AppContext";

export const Context = React.createContext({});

const ChatListScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { currentUser, chats } = React.useContext(AppContext);

  const chatIds = Object.keys(chats);
  const chatsArray = chatIds.map((chatId) => chats[chatId]);

  const navigateToChat = (chatId) => {
    const chat = chats[chatId];
    navigation.navigate("Chat", { chatId: chat.id, chatName: chat.name });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {chatsArray.length > 0 && (
        <FlatList
          data={chatsArray}
          renderItem={({ item }) => {
            return (
              <Text onPress={() => navigateToChat(item.id)} style={styles.item}>
                {item.name}
              </Text>
            );
          }}
          keyExtractor={(item) => item.id}
          extraData={chatIds}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    fontSize: 32,
    marginVertical: 8,
  },
});

export default ChatListScreen;
