const { createStore } = require('redux');
const { combineReducers } = require('redux-immutable');
const { Map, fromJS, List } = require('immutable');

const getHandlers = 'getHandlers';

const toMap = obj => Map.isMap(obj) ? obj : fromJS(obj);
const toList = array => List.isList(array) ? array : fromJS(array);

function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (state === getHandlers) return handlers;
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

function depthOf(obj) {
    const object = Map.isMap(obj) ? obj.toJS() : obj;
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

const addDeleteHandler = handlers =>
    toMap(handlers).set('deleteAll', (state, action) => Map({}));

const nest = (body = Map({}), del, merge) => (key, value = Map({})) => del ? body.delete(key) : merge ? body.set(key, body.get(key).merge(toMap(value))) :
    body.set(key, checkIfObj(value) ? fromJS(value) : value);

const get = name => function check(obj) {
    const thisObj = toMap(obj);
    const v = thisObj.get(name);
    if (v) return v;
    const map = thisObj.filter(Map.isMap);
    return map.size > 0 ? map.map(v => check(v)).find(v => v ? true : false) : undefined;
}

module.exports = {
    createReducer,
    actionToMap,
    depthOf,
    toMap,
    addDeleteHandler,
    toList,
    get,
    getHandlers,
    nest
};