import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Button, Dimensions, Image, StatusBar
} from 'react-native';

const BluetoothModule = ({

}) => {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableOpacity style={styles.button}
                onPress={() => navigation.navigate("BluetoothMainScreen")}
            >
                <Text style={styles.textInput}>
                    {"Go to BLE - Demo"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default BluetoothModule;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7fbfc",
        justifyContent: "center"
    },
    textInput: {
        color: "white",
        fontSize: 14
    },
    button: {
        backgroundColor: "blue",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 10
    }
})
