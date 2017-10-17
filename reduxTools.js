const { createStore } = require('redux');
const { combineReducers } = require('redux-immutable');
const { Map, fromJS, List } = require('immutable');

const getHandlers = 'getHandlers';
const deleteAll = 'deleteAll';

const toMap = obj => Map.isMap(obj) ? obj : fromJS(obj);
const toList = array => List.isList(array) ? array : fromJS(array);

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
    toMap(handlers).set(deleteAll, (state, action) => Map({}));

const checkIfObj = v => typeof v === 'object' && !Map.isMap(v) && !List.isList(v) && v !== null;
//const checkIfObjOrMap = (v1, v2) => (checkIfObj(v1) && !Array.isArray(v1) && checkIfObj(v2) && !Array.isArray(v2)) || (Map.isMap(v1) && Map.isMap(v2));
const checkIfObjOrMap = v => (checkIfObj(v) && !Array.isArray(v)) || Map.isMap(v);
const checkIfObjOrMaporList = v => Array.isArray(v) || List.isList(v) || checkIfObjOrMap(v);

const nest = (body = Map({}), del, merge) => (key, value = Map({})) => {
    const thisBody = toMap(body);
    const thisValue = toMap(value);
    const prevValue = thisBody.get(key);
    return del ? thisBody.delete(key) : merge ? thisBody.set(key, List.isList(prevValue) ? prevValue.push(thisValue) : prevValue.merge(toMap(thisValue))) :
        thisBody.set(key, thisValue);
}

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
    nest,
    checkIfObj,
    checkIfObjOrMap,
    deleteAll,
    checkIfObjOrMaporList
};