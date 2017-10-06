const { createStore } = require('redux');
const { combineReducers } = require('redux-immutable');
const { Map } = require('immutable');

function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        const handle = typeof handlers === 'function' ?
            handlers(state, action) : handlers;
        const isMap = Map.isMap(handle);
        if ((isMap && handle.has(action.type)) || handle.hasOwnProperty(action.type))
            return isMap ? handle.get(action.type)(state, action) : 
                handle[action.type](state, action);
        else return state;
    }
}

//how to use createReducer function:
// const hey = createReducer({paws: 'nuccu'}, (state, action) => ({
//     ['boccu']: () => Object.assign({}, state, {boccu: 'succu'})
// }));

const actionToMap = store => next => action => (next(action.toObject()), action);

function depthOf(object) {
    let level = 1;
    let key;
    for (key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if (typeof object[key] == 'object') {
            let depth = depthOf(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
}

module.exports = {
    createReducer,
    actionToMap,
    depthOf
};