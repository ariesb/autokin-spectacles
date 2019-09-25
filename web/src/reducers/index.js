import { combineReducers } from 'redux';
import { jobsReducer } from './jobs-reducer';
import sessionReducer from './session-reducer';
import projectsReducer from './projects-reducer';
import modalReducer from './modal-reducer';

const rootReducer = combineReducers({
    job: jobsReducer,
    session: sessionReducer,
    projects: projectsReducer,
    modal: modalReducer
});
export default rootReducer;