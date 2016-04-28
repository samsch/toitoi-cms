const CST = require('../shared/constants');
const INITIAL_STATE = { user: null, error: null, loggedIn: null, token: null }

export default function(state = INITIAL_STATE, action) {
  // console.log('action:', action);
  switch(action.type){
    case CST.CONFIRM_USER_SUCCESS:
      return { ...state, loggedIn: true}
    case CST.CONFIRM_USER_FAILURE:
      return { ...state, error: action.payload }
    case CST.LOGIN_REQUEST:
      return { ...state }
    case CST.LOGIN_SUCCESS:
      return { ...state, loggedIn: action.isLoggedIn, user: action.payload.data }
    case CST.LOGIN_FAILURE:
      return { ...state, error: action.payload }
    case CST.TOKEN_REQUEST:
      return { ...state }
    case CST.TOKEN_SUCCESS:
      return { ...state, token: action.payload.token }
    case CST.TOKEN_FAILURE:
      return { ...state, error: action.payload }
    case CST.RETURN_USER:
      return { loggedIn: action.isLoggedIn, user: action.payload.data }
    case CST.LOGOUT_SUCCESS:
      return { ...state, user: null, loggedIn: action.isLoggedIn, token: null }
    default:
      return state;
  }
}
