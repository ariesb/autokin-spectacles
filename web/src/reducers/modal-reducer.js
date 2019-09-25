
import {
    SHOW_MODAL,
    HIDE_MODAL
} from '../actions/modal-actions';

const initialState = {
    show: false
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SHOW_MODAL:
            console.log(action, state);
            return {
                show: true
            }
        case HIDE_MODAL:
            return initialState
        default:
            return state
    }
}