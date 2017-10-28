const { Map, List } = require('immutable');
const R = require('ramda');
const {createStore, applyMiddleware} = require('redux');
const {createSetOfReducers, createUpperReducer} = require('./reducerLogic');