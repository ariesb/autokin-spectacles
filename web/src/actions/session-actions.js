export const USER_LOGGING_IN = 'USER_LOGGING_IN'
export const USER_LOGGED_IN = 'USER_LOGGED_IN'
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT'

export const login = data => dispatch => {
    dispatch({
        type: USER_LOGGING_IN
    });
    setTimeout(() => {
        dispatch({
            type: USER_LOGGED_IN,
            payload: data
        })
    }, 2000);
}

export function logout() {
    return {
        type: USER_LOGGED_OUT,
        payload: null
    }
}