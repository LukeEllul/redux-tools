const { Map, List } = require('immutable');
const R = require('ramda');
const { deleteAll, createReducer } = require('./reduxTools');
const { nest, toList } = require('./datastructures/dataStructures');

const point = '.';

const civilizedReducer = (reducer, name, intialState) =>
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
        return portion === name ?
            state.set(name,
                lowerReducer(
                    state.get(name),
                    nest(action)('type', v.slice(v.indexOf(point) + 1)).toJS()
                )) : state;
    }
}

const changeLowerReducer = upperReducer => lowerReducer =>
    createUpperReducer(upperReducer('getName'))(lowerReducer);

function makeSet(set = Map({})) {
    return (state = Map({}), action) => {
        if (state === 'getSet') return set;
        const v = action.type;
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

const createSetOfReducers = name => (setOfReducers = makeSet()) => {
    let set = setOfReducers;
    let fn = createUpperReducer(name)(set);
    return (state = Map({}), action) => {
        if(action && action.type.slice(0, name.length) === name && action.addReducers){
            set = addReducersToSet(...action.addReducers)(set);
            fn = createUpperReducer(name)(set);
        }
        return fn(state, action);
    }
}

const addToSetOfReducers = (...reducers) => setOfReducers =>
    createSetOfReducers(
        setOfReducers('getName'))
        (addReducersToSet(...reducers)(setOfReducers('getLowerReducer')));

const removeFromSetOfReducers = name => setOfReducers =>
    createUpperReducer(setOfReducers('getName'))(removeReducerFromSet(setOfReducers('getLowerReducer'))(name));

module.exports = {
    createUpperReducer,
    civilizedReducer,
    changeLowerReducer,
    createSetOfReducers,
    addToSetOfReducers,
    removeFromSetOfReducers
}