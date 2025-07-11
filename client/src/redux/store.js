import { configureStore } from "@reduxjs/toolkit";
import activeUserSlice from "./activeUserSlice";
import chatsSlice from "./chatsSlice";
import profileSlice from "./profileSlice";


const store = configureStore({
  reducer: {
    activeUser: activeUserSlice,
    profile: profileSlice,
    chats: chatsSlice,
  },
});

export default store;
