import {
    FETCH_JOB_SUCCESS
} from '../actions/jobs-actions';

const initialState = {
    data: {
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
                data: action.payload
            }
        default:
            return state;
    }
}

export const getJob = state => state.job;
