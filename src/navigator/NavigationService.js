import React from 'react';
import { CommonActions, StackActions } from '@react-navigation/native';

export const navigationRef = React.createRef();

function navigate(routeName, params) {
    navigationRef.current && navigationRef.current.navigate(routeName, params);
}

function push(routeName, params) {
    const pushAction = StackActions.push(routeName, params);
    navigationRef.current && navigationRef.current.dispatch(pushAction);
}

export default {
    navigate,
    push,
};