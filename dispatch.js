const { Map, List } = require('immutable');
const R = require('ramda');
const { toMap, fromMap } = require('./datastructures/dataStructures');

const handleAddReducers = (action, prevAction) => ([store, acc]) => {
    if (action.addReducers) {
        const state1 = store.getState();
        store.dispatch(fromMap(action));
        const reducer = store.getState();
        store.replaceReducer(
            (state, action) => reducer(
                typeof state === 'function' ? state1 : state, action)
        );
        store.dispatch(fromMap(prevAction));
        return [store, acc || 1];
    }
    return [store];
}

const checkPrevAction = prevAction =>
    !prevAction || prevAction.has('addReducers') || prevAction.has('getReducer') ? Map({ type: 'getState' }) : prevAction;

const dispatch = action => ([store, prevAction]) => {
    const [thisStore, acc] = R.pipe(
        handleAddReducers(action, checkPrevAction(prevAction))
    )([store]);
    acc || thisStore.dispatch(fromMap(action));
    return [thisStore, action];
}

const getRootReducer = prevAction => store => {
    const state1 = store.getState();
    store.dispatch({ type: '', getRoot: '' });
    const rootReducer = store.getState();
    store.replaceReducer(
        (state, action) => rootReducer(
            typeof state === 'function' ? state1 : state, action)
    );
    store.dispatch(fromMap(prevAction));
    return rootReducer;
}

const getReducer = (action, prevAction) => store => {
    const rootReducer = getRootReducer(prevAction)(store);
    const setOfReducers = rootReducer(Map({}), action);
    const v = action.type;
    return setOfReducers('getSet').get(v.slice(v.lastIndexOf('.') + 1));
}

const apply = (...actions) => store =>
    R.pipe(...actions.map(action =>
        typeof action === 'function' ? action : dispatch(toMap(action))))([store]);

const showState = ([store, prevAction]) =>
    (console.log(store.getState()), [store, prevAction]);

const get = (type, cb) => ([store, prevAction]) => {
    cb(getReducer({ type: type, getReducer: '' }, checkPrevAction(prevAction))(store));
    return [store, action];
}

const put = (...reducers) => under => Map({
    type: under,
    addReducers: reducers
});

module.exports = {
    apply,
    showState,
    get,
    put
};