const { Map, List } = require('immutable');
const R = require('ramda');
const { deleteAll, createReducer } = require('./reduxTools');
const { nest, toList } = require('./datastructures/dataStructures');
const { createStore, applyMiddleware } = require('redux');

const point = '.';

const civilizedReducer = (name, reducer, intialState) =>
    (state = intialState || Map({}), action) => {
        if (state === 'getName') return name;
        return reducer(state, action);
    }

const createUpperReducer = name => lowerReducer => {
    return (state = Map({}), action) => {
        if (state === 'getName') return name;
        if (state === 'getLowerReducer') return lowerReducer;
        if (action.type === deleteAll) return state.delete(name);
        if (action.type === name && action.getState)
            return (action.getState(state.get(name)), state);
        const v = action.type;
        const portion = v.slice(0, name.length);
        if (portion === name) {
            const lowerReducerValue = lowerReducer(
                state.get(name),
                nest(action)('type', v.slice(v.indexOf(point) + 1)).toJS()
            );
            if (typeof lowerReducerValue === 'function') return lowerReducerValue;
            return state.set(name, lowerReducerValue);
        }
        return state;
    }
}

const changeLowerReducer = upperReducer => lowerReducer =>
    createUpperReducer(upperReducer('getName'))(lowerReducer);

function makeSet(set = Map({})) {
    return (state = Map({}), action) => {
        if (state === 'getSet') return set;
        const v = action && action.type;
        if (!v) return state;
        const reducer = set.find(
            (val, k) => v === k || v.slice(0, v.indexOf(point)) === k);
        return reducer ? reducer(state, action) : state;
    }
}

const addReducersToSet = (...reducers) => (set = makeSet()) =>
    makeSet(reducers.reduce(
        (set, reducer) => {
            const name = reducer('getName');
            return typeof name === 'string' ? set.set(name, reducer) :
                set.merge(name);
        },
        set('getSet')
    ));

const removeReducerFromSet = set => name => makeSet(set('getSet').delete(name));

// const createSetOfReducers = name => (setOfReducers = makeSet()) => {
//     let set = setOfReducers;
//     let fn = createUpperReducer(name)(set);
//     return (state = Map({}), action) => {
//         if(action && action.reducers && action.type.slice(0, name.length) === name){
//             set = addReducersToSet(...action.addReducers)(set);
//             fn = createUpperReducer(name)(set);
//         }
//         return fn(state, action);
//     }
// }

const createSetOfReducers = name => (setOfReducers = makeSet()) => {
    const fn = createUpperReducer(name)(setOfReducers);
    return (state = Map({}), action) => {
        if (state === 'getLowerReducer') return fn(state, action);
        if (action && action.type === '' && action.getRoot === '')
            return createSetOfReducers(name)(setOfReducers);
        if (action && action.addReducers && action.type === name)
            return createSetOfReducers(name)(addReducersToSet(...action.addReducers)(setOfReducers));
        if (action && action.getReducer === '' && action.type.match(new RegExp(`\[${point}]`, 'g')).length === 1 && action.type.slice(0, name.length) === name) {
            return setOfReducers;
        }
        const returnedValue = fn(state, action);
        if (typeof returnedValue === 'function') {
            if (action.getReducer === '') return returnedValue;
            return createSetOfReducers(name)(addReducersToSet(returnedValue)(setOfReducers));
        }
        return returnedValue;
    }
}

const addToSetOfReducers = (...reducers) => setOfReducers =>
    createSetOfReducers(
        setOfReducers('getName'))
        (addReducersToSet(...reducers)(setOfReducers('getLowerReducer')));

const createSet = (...reducers) => name =>
    addToSetOfReducers(...reducers)(createSetOfReducers(name)());

const removeFromSetOfReducers = name => setOfReducers =>
    createUpperReducer(setOfReducers('getName'))(removeReducerFromSet(setOfReducers('getLowerReducer'))(name));

module.exports = {
    createUpperReducer,
    createSetOfReducers,
    addToSetOfReducers,
    createSet
}