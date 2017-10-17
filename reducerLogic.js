const { Map, List } = require('immutable');
const R = require('ramda');
const { deleteAll, createReducer, nest, toList } = require('./redux-tools/reduxTools');

const point = '.';

const createUpperReducer = name => lowerReducer => {
    let thisLowerReducer = lowerReducer;
    return (state = Map({}), action) => {
        if (state === 'getName') return name;
        if (state === 'getLowerReducer') return thisLowerReducer;
        if (action.type === deleteAll) return state.delete(name);
        if (action.type === name && action.changeLowerReducer) {
            thisLowerReducer = action.changeLowerReducer(thisLowerReducer);
            return state;
        }
        if (action.type === name && action.getState)
            return (action.getState(state.get(name)), state);
        const v = action.type;
        const portion = v.slice(0, name.length);
        return portion === name ?
            state.set(name,
                thisLowerReducer(
                    state.get(name),
                    nest(action)('type', v.slice(v.indexOf(point) + 1)).toJS()
                )) : state;
    }
}

function makeSet(set = Map({})) {
    let thisSet = set;
    return (state = Map({}), action) => {
        if (state === 'getSet') return thisSet;
        if(typeof state === 'string' && state.slice(0, 8) === 'remove ')
                return (thisSet = thisSet.remove(state.slice(8)), state);
        const v = action.type;
        const reducer = thisSet.find(
            (val, k) => v === k || v.slice(0, v.indexOf(point)) === k);
        return reducer ? reducer(state, action) : state;
    }
}

const addReducersToSet = (set = makeSet()) => (...reducers) =>
    makeSet(reducers.reduce(
        (set, reducer) => {
            const name = reducer('getName');
            return typeof name === 'string' ? set.set(name, reducer) :
                set.merge(name);
        },
        set('getSet')
    ));

const adjReducers = (...reducers) => (set = makeSet()) => addReducersToSet(set)(...reducers);

module.exports = {
    createUpperReducer,
    adjReducers,
    addReducersToSet
}