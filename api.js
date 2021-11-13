import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// Constants
const USERS = "users";
const CHATS = "chats";
const MESSAGES = "messages";

// TODO: async await the whole file

/**
 * Start listening to the logged in user logged in state. The first time this
 * is set up and the user is already logged in, the logged in user is fetched.
 *
 * @param {Function} cb Callback function for listener
 */
export function startListeningToLoggedInUserChanges(cb) {
  // Start the listener and get the logged in user doc
  firebase.auth().onAuthStateChanged(async (userDoc) => {
    const user = userDoc ? await getUserByUID(userDoc.uid) : null;
    cb(user);
  });
}

/**
 * Get user by user ID
 *
 * @param {String} uid User ID
 */
function getUserByUID(uid) {
  return firebase
    .firestore()
    .collection(USERS)
    .doc(uid)
    .get()
    .then((user) => ({ ...user.data(), uid }));
}

/**
 * Login a user with username and password
 *
 * @param {String} email
 * @param {String} password
 * @returns {Promise}
 */
export function loginUser(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

/**
 * Logout a user
 *
 * @returns {Promise}
 */
export function logoutUser() {
  return firebase.auth().signOut();
}

/**
 * Send a message
 *
 * @param {Object} content The message object
 */
export function sendMsg(content) {
  return firebase.firestore().collection(MESSAGES).doc().set(content);
}

/**
 * Delete a message
 *
 * @param {String} id ID of the message
 */
export function deleteMsg(id) {
  firebase.firestore().collection(MESSAGES).doc(id).delete();
}

/**
 * Get all the chats in which the user is a member
 *
 * @param {Object} uid User ID
 * @param {Object} cb Callback function
 */
export async function getChatsForUser(uid, cb) {
  const updatedChats = {}; // { chatId: { chatData } }

  // Get all the chats the user is a member in
  const chatSnap = await firebase
    .firestore()
    .collection(CHATS)
    .where("members", "array-contains", uid)
    .get();

  // Extract chat info
  chatSnap.forEach((chatDoc) => {
    const id = chatDoc.id;
    updatedChats[id] = { ...chatDoc.data(), id };
  });

  // The members in the chat are only the ids. We need to resolve them.
  // Gather all the ids of the members needed
  const memberIdMap = {}; // { memberId: { meberData } }
  Object.values(updatedChats).forEach((chat) => {
    chat.members.forEach((memberId) => (memberIdMap[memberId] = null));
  });

  // Fetch all the members needed
  const memberSnap = await firebase
    .firestore()
    .collection(USERS)
    .where(
      firebase.firestore.FieldPath.documentId(),
      "in",
      Object.keys(memberIdMap)
    )
    .get();

  // Map all the member ids on the member object
  memberSnap.forEach((memberDoc) => {
    const id = memberDoc.id;
    memberIdMap[id] = { ...memberDoc.data(), id };
  });

  // Place the member objects in the chat objects
  Object.keys(updatedChats).forEach((chatId) => {
    const chat = updatedChats[chatId];
    chat.members = chat.members.map((id) => memberIdMap[id]);
  });

  // Some chats are group chats and have a name. The oher chats are
  // 1-on-1 chats and they need the name of the member that is not the user.
  Object.keys(updatedChats).forEach((chatId) => {
    const chat = updatedChats[chatId];
    chat.isGroup = !!chat.isGroup;
    chat.name = chat.isGroup
      ? chat.name
      : chat.members.filter((m) => m.id !== uid)[0].name;
  });

  // Fetch all the messages for all the chats and place them in the chat objects
  // First we need to add messages arrays to the chat objects
  Object.keys(updatedChats).forEach((id) => (updatedChats[id].messages = []));

  // Fetch messages
  firebase
    .firestore()
    .collection(MESSAGES)
    .where("chatId", "in", Object.keys(updatedChats))
    .onSnapshot((snap) => {
      const chatMessagesMap = {};
      snap.docChanges().forEach((data) => {
        if (data.type === "added") {
          // Construct message
          const doc = data.doc;
          const msg = { ...doc.data(), id: doc.id };

          // Add messages to map
          const chatId = doc.data().chatId;
          if (chatId in chatMessagesMap) {
            chatMessagesMap[chatId].push(msg);
          } else {
            chatMessagesMap[chatId] = [msg];
          }
        }
      });

      // Add messages to chat objects
      Object.keys(chatMessagesMap).forEach((chatId) => {
        updatedChats[chatId].messages = [
          ...updatedChats[chatId].messages,
          ...chatMessagesMap[chatId].sort((a, b) => a.createdAt - b.createdAt),
        ];
      });

      cb(updatedChats);
    });
}
