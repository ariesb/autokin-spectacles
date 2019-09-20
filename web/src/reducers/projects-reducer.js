import {
    FETCH_PROJECTS_SUCCESS
} from '../actions/projects-actions';

const initialState = {
    projects: [],
    pending: true
}

export default function projectsReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_PROJECTS_SUCCESS:
            return {
                ...state,
                pending: false,
                projects: action.payload
            }
        default:
            return state;
    }
}

