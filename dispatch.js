const { Map, List } = require('immutable');
const R = require('ramda');
const {createStore, applyMiddleware} = require('redux');
const {createSetOfReducers, createUpperReducer} = require('./reducerLogic');
const {toMap} = require('./datastructures/dataStructures');

const handleAddReducers = (returnedDispatch, prevAction) => store => 
    typeof returnedDispatch === 'function' ? (
        store.replaceReducer(returnedDispatch),
        store.dispatch(prevAction),
        store
    ) : store;

const dispatch = action => ([store, prevAction]) => {
    const returnedDispatch = store.dispatch(action);
    return [R.pipe(
        handleAddReducers(returnedDispatch, prevAction)
    )(store), action];
}

module.exports = {
    dispatch
}