import {
    FETCH_JOB_SUCCESS
} from '../actions/jobs-actions';

const initialState = {
    result: {
        when: new Date().toUTCString(),
        screens: []
    },
    pending: true
}

export function jobsReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_JOB_SUCCESS:
            return {
                ...state,
                pending: false,
                result: action.payload
            }
        default:
            return state;
    }
}

export const getJob = state => state.job;
