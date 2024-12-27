import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state type
interface MyState {
  filterBy: string;
}

// Define the initial state
const initialState: MyState = {
  filterBy: "",
};

// Create a slice
const mySlice = createSlice({
  name: "utils",
  initialState,
  reducers: {
    // Action to set the value
    setFilterBy(state, action: PayloadAction<string>) {
      state.filterBy = action.payload;
    },
  },
});

// Export the actions
export const { setFilterBy } = mySlice.actions;

// Export the reducer
export default mySlice.reducer;
