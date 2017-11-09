const { Map, List } = require('immutable');
const R = require('ramda');
const { toMap, fromMap } = require('./datastructures/dataStructures');
const { point } = require('./reducerLogic');

const changeReducer = (currentState, reducer) =>
    (state, action) => action.type === 'getState1' ? currentState : reducer(state, action);

const handleAddReducers = action => ([store, acc]) => {
    if (action.addReducers) {
        const state1 = store.getState();
        store.dispatch(fromMap(action));
        const reducer = store.getState();
        store.replaceReducer(changeReducer(state1, reducer));
        store.dispatch({ type: 'getState1' });
        return [store, acc || 1];
    }
    return [store];
}

const checkPrevAction = prevAction =>
    !prevAction || prevAction.has('addReducers') || prevAction.has('getReducer') ? Map({ type: 'getState' }) : prevAction;

const dispatch = action => ([store, prevAction]) => {
    const [thisStore, acc] = R.pipe(
        handleAddReducers(fromMap(action))
    )([store]);
    acc || thisStore.dispatch(fromMap(action));
    return [thisStore, action];
}

const getRootReducer = store => {
    const state1 = store.getState();
    store.dispatch({ type: '', getRoot: '' });
    const rootReducer = store.getState();
    store.replaceReducer(changeReducer(state1, rootReducer));
    store.dispatch({ type: 'getState1' });
    return rootReducer;
}

const getReducer = action => store => {
    const rootReducer = getRootReducer(store);
    const setOfReducers = rootReducer(Map({}), action);
    const v = action.type;
    return setOfReducers('getSet').get(v.slice(v.lastIndexOf(point) + 1));
}

const apply = (...actions) => store =>
    R.pipe(...actions.map(action =>
        typeof action === 'function' ? action : dispatch(toMap(action))))([store]);

const showState = ([store, prevAction]) =>
    (console.log(store.getState()), [store, prevAction]);

const get = (type, cb) => ([store, prevAction]) => {
    cb(getReducer({ type: type, getReducer: '' })(store));
    return [store, prevAction];
}

const put = (...reducers) => under => Map({
    type: under,
    addReducers: reducers
});

const under = name => sub => name + point + sub;

module.exports = {
    apply,
    showState,
    get,
    put,
    under
};