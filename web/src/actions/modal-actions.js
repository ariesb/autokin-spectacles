export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const showModal = () => {
    return {
        type: SHOW_MODAL,
        show: true
    }
}

export const hideModal = () => dispatch => {
    dispatch({
        type: HIDE_MODAL,
        payload: { show: true }
    });
}