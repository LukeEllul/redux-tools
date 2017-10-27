const createSetOfReducers = name => (setOfReducers = makeSet()) => {
    let set = setOfReducers;
    let fn = createUpperReducer(name)(set);
    return (state = Map({}), action) => {
        if(action && action.reducers && action.type.slice(0, name.length) === name){
            set = addReducersToSet(...action.addReducers)(set);
            fn = createUpperReducer(name)(set);
        }
        return fn(state, action);
    }
}