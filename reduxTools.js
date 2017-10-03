const { createStore } = require('redux');
const { combineReducers } = require('redux-immutable');
const { Map } = require('immutable');

function createReducer(initialState, handlers){
    return function reducer(state = initialState, action){
        const handle = typeof handlers === 'function' ? 
            handlers(state, action) : handlers;
        if(handle.hasOwnProperty(action.type))
            return handle[action.type](state, action);
        else return state;
    }
}

//how to use createReducer function:
// const hey = createReducer({paws: 'nuccu'}, (state, action) => ({
//     ['boccu']: () => Object.assign({}, state, {boccu: 'succu'})
// }));

module.exports = {
    createReducer
};