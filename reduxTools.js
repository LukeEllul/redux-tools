const { createStore } = require('redux');
const { combineReducers } = require('redux-immutable');
const { Map } = require('immutable');
const { toMap } = require('./datastructures/dataStructures');

const getHandlers = 'getHandlers';
const deleteAll = 'deleteAll';

function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (state === getHandlers || state === 'getName') return handlers;
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

const addDeleteHandler = handlers =>
    toMap(handlers).set(deleteAll, (state, action) => Map({}));


module.exports = {
    createReducer,
    actionToMap,
    addDeleteHandler,
    getHandlers,
    deleteAll
};