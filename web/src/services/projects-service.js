import { fetchProjectsSuccess }  from '../actions/projects-actions';

export const fetchProjects = () => {
    return dispatch => {
        fetch(`/api/projects`)
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(fetchProjectsSuccess(res)); 
                return res;
            })
            .catch(error => {
                // dispatch(fetchProjectError(error));
                console.log(error);
            })
    }
}
