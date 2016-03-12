// import axios from 'axios'
'use strict';

const CST = require('../shared/constants');
const axios = require('axios');
const Firebase = require('firebase');
const firebaseRef = new Firebase(CST.FIREBASE_URL);
const webSocketRef = new WebSocket(CST.WEBSOCKET_URL);

/*** TODO remove the following after setpassword code is finalized ***/
export const SET_PASSWORD = 'SET_PASSWORD';
export const LOGIN_USER = 'LOGIN_USER';
export const AUTH_SET_TOKEN = 'SET_TOKEN';
export const AUTH_DISCARD_TOKEN = 'DISCARD_TOKEN';
export const AUTH_SET_USER = 'SET_USER';


// using info learned from https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/

// TODO: need to integrate with auth server
export function setPassword() {
  //make some API request here to set password
  //placeholder, set request = true
  const request = true;

  return {
    type: SET_PASSWORD,
    payload: request
  }
}
/*** end of TODO ***/

// Calls the API to get a token and
// dispatches actions along the way
export function loginUser(creds) {
  return function(dispatch) {
    dispatch(requestLogin(creds))
    // axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post(`${CST.LOGIN_URL}/login`, creds, { withCredentials: true })
    .then((response) => {
      // console.log('login response:', response)
      dispatch(receiveLogin(response));
    })
    .then(() => {
      dispatch(requestToken());
    })
    .catch((err) => {
      dispatch(loginError(err));
    });
  }
}

function requestLogin(creds) {
  return {
    type: CST.LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    hasToken: false,
    creds
  }
}

function receiveLogin(response) {
  return {
    type: CST.LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    hasToken: false,
    payload: response
  }
}

function loginError(response) {
  console.log('error:', response);
  return {
    type: CST.LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    hasToken: false,
    payload: response
  }
}

export function requestToken() {
  return function(dispatch) {
    axios.post(`${CST.LOGIN_URL}/generate-token`, null, { withCredentials: true })
    .then((response) => {
      // console.log('token response:', response)
      dispatch(receiveToken(response))
    })
    .catch((err) => {
      // console.log('token req error:', err)
      dispatch(loginError(err))
    });
  }
}

function receiveToken(response) {
  return {
    type: CST.TOKEN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    hasToken: true,
    payload: response
  }
}


export function getFirebaseData() {
  return function(dispatch) {
    dispatch(requestFirebase());
    firebaseRef.on('value', function(snapshot) {
      dispatch(receiveFirebase(snapshot.val()));
    }, function (errorObject) {
      dispatch(firebaseError(errorObject));
      console.log('The read failed: ' + errorObject.code);
    });
  }
}

function requestFirebase() {
  return {
    type: CST.FIREBASE_REQUEST,
    isFetching: true
  }
}

function receiveFirebase(response) {
  return {
    type: CST.FIREBASE_RECEIVE,
    isFetching: false,
    payload: response
  }
}

function firebaseError(response) {
  return {
    type: CST.FIREBASE_FAILURE,
    isFetching: false,
    payload: response
  }
}

export function updateSingleFirebaseData(entry) {
  return function(dispatch) {
    // get firebase-generated key from object
    let childRef = firebaseRef.child(entry.key);
    // store attributes into object for passing into Firebase
    let updateObj = {};
    for (var prop in entry) {
      if (prop != 'key') {
        updateObj[prop] = entry[prop];
      }
    }
    childRef.update(updateObj, function(error){
      if (error) {
        console.log('Data could not be saved.' + error);
        dispatch(updateFirebase(error));
      } else {
        dispatch(updateFirebase());
      }
    });
  }
}

function updateFirebase() {
  return {
    type: CST.FIREBASE_UPDATE,
    isFetching: false
  }
}

export function publishSite(token) {
  return function(dispatch) {
    dispatch(requestPublishSite());
    webSocketRef.send({
      'site': 'demo.toitoi.co',
      'token': token,
      'messageType': 'build'
    });
    webSocketRef.onerror = function(error) {
      console.log('WebSocket Error:', error);
      dispatch(publishSiteError(error));
    }
    webSocketRef.onmessage = function(evt) {
      console.log('WebSocket Message:', evt.data);
      dispatch(publishSiteSuccess(evt.data));
    }
  }
}


function requestPublishSite() {
  return {
    type: CST.PUBLISH_REQUEST
  }
}

function publishSiteSuccess(response) {
  return {
    type: CST.PUBLISH_SUCCESS,
    payload: response
  }
}

function publishSiteError(response) {
  return {
    type: CST.PUBLISH_ERROR,
    payload: response
  }
}
