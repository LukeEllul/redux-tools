const { Map, List } = require('immutable');
const R = require('ramda');
const {createStore, applyMiddleware} = require('redux');
const {createSetOfReducers, createUpperReducer, createSet, addReducersMiddleWare} = require('./reducerLogic');
const {toMap, fromMap} = require('./datastructures/dataStructures');

const handleAddReducers = (returnedDispatch, prevAction = {}) => store => 
    typeof returnedDispatch === 'function' ? (
        store.replaceReducer(returnedDispatch),
        store.dispatch(fromMap(prevAction)),
        store
    ) : store;

const dispatch = action => ([store, prevAction]) => {
    const returnedDispatch = store.dispatch(fromMap(action));
    return [R.pipe(
        handleAddReducers(returnedDispatch, prevAction)
    )(store), action];
}

const showState = ([store, prevAction]) =>
    (console.log(store.getState()), [store, prevAction]);

const apply = (...actions) => store =>
    R.pipe(...actions.map(action => dispatch(toMap(action))))([store]);

module.exports = {
    dispatch,
    apply,
    showState
}