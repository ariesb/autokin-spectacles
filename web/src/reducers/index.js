import { combineReducers } from 'redux';
import { jobsReducer } from './jobs-reducer';
import sessionReducer from './session-reducer';
import projectsReducer from './projects-reducer';

const rootReducer = combineReducers({
    job: jobsReducer,
    session: sessionReducer,
    projects: projectsReducer
});
export default rootReducer;