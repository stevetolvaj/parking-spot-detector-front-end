import { RootState } from "../store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { LoginStatus, UserState, User } from "./index";

const initialState: UserState = {
  id: 0,
  name: "",
  username: "",
  email: "",
  status: LoginStatus.IDLE,
  address: {
    street: "",
    suite: "",
    city: "",
    zipcode: "",
    geo: {
      lat: 0,
      lng: 0,
    },
  },
};

export const fetchUserAsync = createAsyncThunk(
  "user/fetchUser",
  async (email: string) => {
    try {
      const response = await axios.get<UserState[]>(
        "https://jsonplaceholder.typicode.com/users/?email=" + email
      );
      let data = response.data[0];
      if (response.data.length < 1) {
        alert("Invalid username or password");
        throw console.warn("Invalid Username or Password!!!");
      }
      console.log(response.data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        throw error;
      }
      throw error;
    }
  }
);

// TODO add registration url

export const registerUser = createAsyncThunk(
  // action type string
  "user/register",
  // callback function
  async (user: User) => {
    try {
      // configure header's Content-Type as JSON
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      // make request to backend
      await axios.post("/api/user/register", JSON.stringify({ user }), config);
    } catch (error) {
      // return custom error message from API if any
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
      }
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    currentUser: (state, action: PayloadAction<UserState>) => {
      state = action.payload;
    },
    logoutUser: (state) => {
      state.address = initialState.address;
      state.id = initialState.id;
      state.email = initialState.email;
      state.name = initialState.name;
      state.username = initialState.username;
      state.status = LoginStatus.IDLE;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAsync.pending, (state) => {
        state.status = LoginStatus.LOADING;
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.id = action.payload!.id;
        state.status = LoginStatus.SUCCEEDED;
        state.name = action.payload!.name;
        state.username = action.payload!.username;
        state.email = action.payload!.email;
        state.address = action.payload?.address;
      })
      .addCase(fetchUserAsync.rejected, (state) => {
        state.status = LoginStatus.FAILED;
      });
  },
});

export const { currentUser, logoutUser } = userSlice.actions;

// User ID global
export const selectUserId = (state: RootState) => state.user.id;

export default userSlice.reducer;
