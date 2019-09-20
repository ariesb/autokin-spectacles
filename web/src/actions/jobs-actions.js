export const FETCH_JOB_SUCCESS = 'FETCH_JOB_SUCCESS';

export const  fetchJobSuccess = (job) => {
    return {
        type: FETCH_JOB_SUCCESS,
        payload: job
    }
}

