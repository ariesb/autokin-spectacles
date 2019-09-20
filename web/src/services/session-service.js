import { login, logout } from '../actions/session-actions';

export const fetchProfile = (token) => {
    return dispatch => {
        fetch(`/auth/profile/${token}`)
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(login(res));
                return res;
            })
            .catch(error => {
                dispatch(logout());
                return false;
            })
    }
}

export const revokeSession = (token) => {
    return dispatch => {
        fetch(`/auth/revoke/${token}`)
            .then(res => {
                dispatch(logout());
            })
            .catch(error => {
                dispatch(logout());
            })
    }
}
