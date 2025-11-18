import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


interface UserState {
  uid: string | null;
  email: string | null;
  name: string | null;
  photo: string | null;
}

const initialState: UserState = {
  uid: null,
  email: null,
  name: null,
  photo: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.photo = action.payload.photo;
    },
    clearUser: (state) => {
      state.uid = null;
      state.email = null;
      state.name = null;
      state.photo = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
