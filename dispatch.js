const { Map, List } = require('immutable');
const R = require('ramda');
const {createStore, applyMiddleware} = require('redux');
const {createSetOfReducers, createUpperReducer, createSet} = require('./reducerLogic');
const {toMap} = require('./datastructures/dataStructures');

const handleAddReducers = (returnedDispatch, prevAction = {}) => store => 
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

const root = createSet(
    createUpperReducer('red1')((state = Map({}), action) => state.set('boccu', 'paws')),
    createSet(
        createUpperReducer('1')((state = Map({}), action) => state.set('1', 'nuccu')),
        createUpperReducer('2')((state = Map({}), action) => state.set('2', 'succu'))
    )('red2')
)('root');

const store = createStore(root);

store.dispatch({
    type: 'root.red1'
});

console.log(store.getState());