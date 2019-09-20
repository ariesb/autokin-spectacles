export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';

export const fetchProjectsSuccess = (projects) => {
    return {
        type: FETCH_PROJECTS_SUCCESS,
        payload: projects
    }
}

