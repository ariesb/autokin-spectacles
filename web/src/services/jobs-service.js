import { fetchJobSuccess }  from '../actions/jobs-actions';

export const fetchJob = (pid, fid, jid) => {
    return dispatch => {
        fetch(`/api/${pid}/${fid}/jobs/${jid}`)
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(fetchJobSuccess(res)); 
                return res;
            })
            .catch(error => {
                // dispatch(fetchJobError(error));
                console.log(error);
            })
    }
}

export const updateJob = ({pid, fid, jid, source, who, action}) => {
    return dispatch => {
        fetch(`/api/${pid}/${fid}/jobs/${jid}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source,
                who,
                action
            })
         })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(fetchJobSuccess(res));
                return res;
            })
            .catch(error => {
                // dispatch(fetchJobError(error));
                console.log(error);
            })
    }
}
