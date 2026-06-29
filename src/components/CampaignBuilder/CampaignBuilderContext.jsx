import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  title: 'Untitled Campaign',
  description: '',
  rewardPerUser: 50,
  maxParticipants: 100,
  blocks: [], // Array of block objects
  selectedBlockId: null,
  isPreviewing: false,
};

function campaignReducer(state, action) {
  switch (action.type) {
    case 'SET_META':
      return { ...state, ...action.payload };
    case 'ADD_BLOCK':
      return { 
        ...state, 
        blocks: [...state.blocks, action.payload],
        selectedBlockId: action.payload.id 
      };
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map(b => b.id === action.payload.id ? { ...b, ...action.payload.updates } : b)
      };
    case 'REMOVE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.filter(b => b.id !== action.payload),
        selectedBlockId: state.selectedBlockId === action.payload ? null : state.selectedBlockId
      };
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.payload };
    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewing: !state.isPreviewing };
    case 'REORDER_BLOCKS':
      return { ...state, blocks: action.payload };
    default:
      return state;
  }
}

const CampaignContext = createContext();

export function CampaignProvider({ children }) {
  const [state, dispatch] = useReducer(campaignReducer, initialState);
  return (
    <CampaignContext.Provider value={{ state, dispatch }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  return useContext(CampaignContext);
}
