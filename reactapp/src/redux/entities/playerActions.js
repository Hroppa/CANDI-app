import { createSelector, createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { gameServer } from "../../config";
import { apiCallBegan } from "../api"; // Import Redux API call

// Create entity slice of the store
const slice = createSlice({
  name: "playerActions",
	initialState: {
    list: [],
    loading: false,
    loaded: false,
    lastFetch: null,
    failedAttempts: 0,
    filter: ''
  },
  // Reducers - playerActions
  reducers: {
    playerActionsRequested: (playerActions, action) => {
      console.log(`${action.type} Dispatched...`)
      playerActions.loading = true;
    },
    playerActionsReceived: (playerActions, action) => {
      console.log(`${action.type} Dispatched...`);
      playerActions.list = action.payload;
      playerActions.loading = false;
      playerActions.lastFetch = Date.now();
      playerActions.loaded = true;
    },
    playerActionsRequestFailed: (playerActions, action) => {
      console.log(`${action.type} Dispatched`)
      playerActions.loading = false;
      playerActions.failedAttempts++;
      // socket.emit('trigger', 'updateActions');
    },
    actionAdded: (playerActions, action) => {
      console.log(`${action.type} Dispatched`)
      playerActions.list.push(action.payload);
      playerActions.loading = false;
    },
    actionDeleted: (playerActions, action) => {
      console.log(`${action.type} Dispatched`)
      const index = playerActions.list.findIndex(el => el._id === action.payload._id);
      playerActions.list.splice(index, 1);
    },
    setFilter: (playerActions, action) => {
      console.log(`${action.type} Dispatched`);
      playerActions.filter = action.payload;
    },
    playerActionUpdated: (playerActions, action) => {
      console.log(`${action.type} Dispatched`)
      console.log(`Payload : ${action.payload._id}`)
      const index = playerActions.list.findIndex(el => el._id === action.payload._id);
      playerActions.list[index] = action.payload;
    }
  }
});

// Action Export
export const {
  actionAdded,
  playerActionsReceived,
  playerActionsRequested,
  playerActionsRequestFailed,
  actionDeleted,
  setFilter,
  playerActionUpdated
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
let baseURL = `${gameServer}api/actions`;

// Selector
export const getMyActions = createSelector(
  state => state.actions.filter,
  state => state.actions.list,
  state => state.characters.list.find(el => el.username === state.auth.user.username),
  (filter, actions, myCharacter) => actions.filter(
    action => (action.creator._id === myCharacter._id && ( action.description.toLowerCase().includes(filter.toLowerCase()) ||
    action.intent.toLowerCase().includes(filter.toLowerCase()) ))
  )
);

export const filteredActions = createSelector(
  state => state.actions.filter,
  state => state.actions.list,
  (filter, actions) => actions.filter(action => action.description.toLowerCase().includes(filter.toLowerCase()) || 
  action.intent.toLowerCase().includes(filter.toLowerCase()) || 
  action.creator.characterName.toLowerCase().includes(filter.toLowerCase())
  )
);

// playerActions Loader into state
export const loadplayerActions = payload => (dispatch, getState) => {
  let url = baseURL;
  /*
  if (!payload.roles.some(el => el === 'Control' )) {
    url = `${baseURL}/${payload.username}`
  }  
  */

  
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      data: payload,
      onStart:playerActionsRequested.type,
      onSuccess: playerActionsReceived.type,
      onError:playerActionsRequestFailed.type
    })
  );
};

// get all actions Loader into state for "emergencies"
export const loadAllActions = payload => (dispatch, getState) => {
  let url = baseURL;
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      data: payload,
      onStart:playerActionsRequested.type,
      onSuccess: playerActionsReceived.type,
      onError:playerActionsRequestFailed.type
    })
  );
};