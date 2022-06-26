/**
 * Sample BLE React Native BletoothMainScreen
 *
 * @format
 * @flow strict-local
 */

import React, {
    useState,
    useEffect,
} from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    NativeModules,
    NativeEventEmitter,
    Platform,
    PermissionsAndroid,
    FlatList,
    TouchableHighlight,
    TouchableOpacity,
    RefreshControl,
    Image,
    Modal,
    ActivityIndicator,
    ToastAndroid,
    TextInput,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';
import BleManager from "react-native-ble-manager";
import { bytesToString } from "convert-string";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { CustomHeader, CustomLoader } from "react-native-reusable-custom-components";
import images from '../assets/images/images';
import { useNavigation } from '@react-navigation/native';

//*** Required Libraries and Device Information
// We used react-native-ble-manager library to connect central and peripheral device, to make BLE 
// We used Mansaa Smart Blub to make this demo and perform operation
// We used react-native-color-picker to display color picker 


const BletoothMainScreen = (props) => {
    const [isScanning, setIsScanning] = useState(false);
    const [notifyValueFromBLE, setNotifyValue] = useState("");
    const peripherals = new Map();
    const [list, setList] = useState([]);
    const [randomNumber, setRandom] = useState(Date.now())
    const [isBluetoothStarted, setBluetoothtoggle] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [helpModalVisible, toggleHelpModal] = useState(false)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [renameValue, setRenameValue] = useState("")
    const [selectedPeripheral, setSelectedPeripheral] = useState(null)

    const navigation = useNavigation();

    const serviceUUIDForWriteBlubColor = "ffb0"
    const characteristicUUIDForWriteBlubColor = "ffb2"
    const characteristicUUIDForChangeBlubName = "ffb7"


    useEffect(() => {
        /**
        //* Initialize the BLE 
         */
        BleManager.start({ showAlert: false, forceLegacy: true });

        checkForBluetoothPermission()

    }, []);


    useEffect(() => {
        /**Initialize the BLE */
        BleManager.start({ showAlert: false, forceLegacy: true });

        /**
         *//* Listener to handle the opeation when device is connected , disconnected Handle stop scan
, when any value will update from BLE device
*/
        const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        const ble2 = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
        const ble3 = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        const ble4 = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

        //*Checking the Bluetooth Permission
        checkForBluetoothPermission()

        return (() => {
            ble1.remove()
            ble2.remove()
            ble3.remove()
            ble4.remove()
        })
    }, []);



    /**
     * //* Handle the bluetooth Stop scan
     */
    const handleStopScan = () => {
        setIsScanning(false);
        setIsRefreshing(false)
    }

    /**
     * //* method to Handle when peripheral will disconnected
     */
    const handleDisconnectedPeripheral = (data) => {
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        alert("BLE Device is Disconnected")
        props.navigation.goBack()
    }

    /**
     * //* Method to handle Value which we get from Peripheral Device
     */
    const handleUpdateValueForCharacteristic = (data) => {
        setNotifyValue("")
        const converteddata = bytesToString(data.value);

        function bytesToWritableArray(bytes) {
            let value = [];
            for (let index = 0; index < bytes.length; index++) {
                value.push(parseInt(bytes[index], 8))
            }
            return value;
        }

        var arr = bytesToWritableArray(data.dataValue);

        function bin2String(array) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
                result += String.fromCharCode(parseInt(array[i], 2));
            }
            return result;
        }

        let bytesView = new Uint8Array(data.value);
        let str = new TextDecoder().decode(bytesView);
        setNotifyValue(str)

        alert("successfully read: " + str)
    }


    /**
     *//* Enable the Bluetooth Permission
*/
    const enableBluetoothInDevice = () => {
        BleManager.enableBluetooth()
            .then(() => {
                // Success code
                setBluetoothtoggle(true)
                //** Start the scanning */
                startScan()
            })
            .catch((error) => {
                console.log("rror-r---->", error);
            });
    }
    /**
     * //* Start the bluetooth scanning
     */
    const startScan = () => {
        if (!isScanning) {
            BleManager.scan([], 10, true).then((results) => {
                console.log('Scanning...');
                setIsScanning(true);
            }).catch(err => {
                console.error(err);
            });
        }
    }

    /**
     * //* Method to handle when Peripheral is connected.
     */
    const handleDiscoverPeripheral = (peripheral) => {
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
        setRandom(Date.now())
    }

    const onRefresh = () => {
        setIsRefreshing(true)
        startScan()
    }

    /**
     * //* Check the Bluetooth Permission For Android and  request if required.
     */
    const checkForBluetoothPermission = () => {
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            let finalPermission = Platform.Version >= 29
                ? PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                : PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
            PermissionsAndroid.check(finalPermission).then((result) => {
                if (result) {
                    //* Enable the Bluetooth capability
                    enableBluetoothInDevice()
                } else {
                    PermissionsAndroid.request(finalPermission).then((result) => {
                        if (result) {
                            //* Enable the Bluetooth capability
                            enableBluetoothInDevice()
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }
        else {
            console.log("IOS");
            enableBluetoothInDevice()
        }
    }

    /**
     * //* Render data when no device connected
     */
    const renderListEmptyComponent = () => {
        return (
            <View style={styles.emptyMainView}>
                {
                    isScanning ?
                        <Text style={styles.scanningText}>{"Scanning for Smart Blub..."}</Text>
                        :
                        <View>
                            <Text style={styles.noBlubText}>{"No Smart Blub Found."}</Text>
                            <Text style={styles.pleaseMakeText}>{"Please make sure smart blubs are powered on."}</Text>

                            <Text style={styles.touubleShootHelp}>{"Troubleshooting Help"}</Text>
                            <Text style={styles.descText}>{"1. Restart the bluetooth"}</Text>
                            <Text style={styles.descText}>{"2. Click on Refresh Icon."}</Text>
                            <Text style={styles.descText}>{"3. Restart Smart blub."}</Text>
                            <Text style={styles.descText}>{"4. Unintstall app and reinstall again."}</Text>
                        </View>
                }
            </View>
        )
    }

    /**
     * //* Render single item of list of connected BLE Periphrals
     */
    const renderBlubList = ({ item, index }) => {
        let isDevice = item.id == "8C:8B:83:47:0F:BC" ? true : false
        return (
            <TouchableOpacity style={{
                ...styles.bulbWrapView,
                backgroundColor: isDevice ? "gray" : "white"
            }}
                onPress={() => onPressSingleBlub(item, index)}
            >
                <View style={styles.bulbView}>
                    <Image source={images.smartBlubIcon} style={styles.smartBlubIcon} />
                    <Text style={styles.bulbText}>{"Smart Bulb " + (index + 1)}</Text>
                </View>
                {
                    item.isConnecting ?
                        <View style={styles.activityindicator}>
                            <ActivityIndicator />
                        </View>
                        : null
                }
                {
                    <TouchableOpacity
                        onPress={() => {
                            setRenameModalVisible(true)
                            setSelectedPeripheral(item)
                        }}
                        style={styles.ranameView}>
                        <Text style={styles.renameText}>{"Rename"}</Text>
                    </TouchableOpacity>
                }
            </TouchableOpacity>
        )
    }

    //* method to handle click event when user click on single blub
    const onPressSingleBlub = (item, index) => {
        connectBLEDevice(item, index)
    }

    //* method to handle click event when user click on single blub
    const connectBLEDevice = (item, index) => {
        toggleConnecting(true, index)
        /**
         * //* Checking if Peripheral is connected Or not
         */
        BleManager.isPeripheralConnected(item.id, []).then((res) => {
            if (res == false) {
                /**
                 * //* Method to connect with Peripheral
                 */
                BleManager.connect(item.id)
                    .then((res7) => {
                        //* Connection is established
                        redirectUserToNext(item, index)
                    }).catch((error) => {
                        console.log("Error---BLE connect--->", error);
                        toggleConnecting(false, index)
                        ToastAndroid.show("Something went wrong while connecting..", ToastAndroid.SHORT)
                    })
            }
            else {
                //* Connection already is established
                redirectUserToNext(item, index)
            }
        }).catch((error) => {
            toggleConnecting(false, index)
            ToastAndroid.show("Something went wrong while connecting..", ToastAndroid.SHORT)
        })
    }


    //* after Connection is established , redirect user to next screen
    const redirectUserToNext = (item, index) => {
        toggleConnecting(false, index)
        ToastAndroid.show("Connected successfully", ToastAndroid.SHORT)
        navigation.navigate("BLEDeviceService", {
            peripheral: item
        })
    }

    const toggleConnecting = (value, index) => {
        let temp = list;
        temp[index].isConnecting = value;
        setList(temp)
        setRandom(Date.now())
    }

    const onRequestClose = () => {
        toggleHelpModal(false)
        setRenameModalVisible(false)
        setSelectedPeripheral(null)
        setRenameValue("")
    }

    const onRequestCloseRenameModal = () => {
        setRenameModalVisible(false)
    }

    const getCharCodes = (s) => {
        let charCodeArr = [];
        for (let i = 0; i < s.length; i++) {
            let code = s.charCodeAt(i);
            charCodeArr.push(code);
        }
        return charCodeArr;
    }

    const onPressRenameDevice = () => {
        if (renameValue.trim() == "") {
            alert("Please enter value")
        }
        else {
            if (selectedPeripheral) {
                /**
                *//* Again checking that BLE peripheral is connected or not
                 */
                BleManager.isPeripheralConnected(selectedPeripheral.id, []).then((res) => {
                    console.log(`${selectedPeripheral.name} is connected???`, res);

                    if (res == false) {
                        console.log("******not connected so going to connect...........");
                        /**
                         * //*method to connect the peripheral with our app
                         */
                        BleManager.connect(selectedPeripheral.id)
                            .then((res7) => {
                                // Success code
                                console.log("connect started", res7);
                                renameBlubValue()
                            })
                            .catch((error) => { console.log("error---456464454->", error); });
                    }
                    else {
                        renameBlubValue()
                    }
                }).catch((error) => { console.log("Error--->", error) })
            }
            else {

            }
        }
    }

    /**
     * Rename the blub name
     * Here we have to pass 19 byte array with ascii value of string as per Hardware/Peripheral Requirement.
     */
    const renameBlubValue = () => {

        let renameValueToRenameBlub = renameValue
        if (renameValueToRenameBlub.length < 19) {
            let difference = 19 - renameValueToRenameBlub.length;
            renameValueToRenameBlub = renameValueToRenameBlub.padEnd(19, ' ');
        }

        const valueForRenameBlub = getCharCodes(renameValueToRenameBlub);
        BleManager.write(
            selectedPeripheral.id,
            serviceUUIDForWriteBlubColor,
            characteristicUUIDForChangeBlubName,
            valueForRenameBlub
        ).then((characteristic) => {
            ToastAndroid.show("Blub name changed successfully.", ToastAndroid.SHORT)
            startScan()
            onRequestClose()
        }).catch((error) => {
            console.log("Error--write name->", error);
            ToastAndroid.show("Something went wrong while writing values..", ToastAndroid.SHORT)
            onRequestClose()
        })
    }

    console.log("list ------>", list);
    return (
        <View style={styles.container}>
            <CustomHeader
                backButton
                middleText='Bluetooth Low Energy'
                onBackButtonPress={() => navigation.goBack()}
            />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => onRefresh()}
                    />
                }
                contentContainerStyle={styles.contentContainerStyle}
            >

                <FlatList
                    data={list}
                    keyExtractor={item => item.id}
                    extraData={randomNumber}
                    contentContainerStyle={styles.contentContainerStyle}
                    ListEmptyComponent={renderListEmptyComponent}
                    renderItem={renderBlubList}
                />
            </ScrollView>
            {
                isScanning ?
                    <CustomLoader loading={isScanning} />
                    : null
            }
            <View style={styles.scamWrapView}>
                <TouchableOpacity style={styles.startScanView} onPress={startScan}>
                    <Image
                        source={images.refreshIcon}
                        style={styles.refreshIcon}
                    />
                    <Text style={styles.refreshText}>{"Refresh"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => toggleHelpModal(true)}
                    style={styles.startScanView} >
                    <Image
                        source={images.helpIcon}
                        style={styles.refreshIcon}
                    />
                    <Text style={styles.refreshText}>{"Help"}</Text>
                </TouchableOpacity>
            </View>

            <View>
                <Modal
                    visible={helpModalVisible}
                    animationType={'slide'}
                    onRequestClose={onRequestClose}
                    transparent={true}
                >
                    <TouchableHighlight
                        underlayColor={"transparent"}
                        onPress={onRequestClose}
                        style={styles.outerViewModalStyle}
                    >
                        <TouchableOpacity delayPressIn={0} onPress={() => null} activeOpacity={1}>
                            <View style={styles.modal}>
                                <View style={{ paddingHorizontal: 20 }}>
                                    <Text style={styles.troubleShotHelp}>{"Troubleshooting Help"}</Text>
                                    <Text style={styles.descText}>{"1. Restart the bluetooth"}</Text>
                                    <Text style={styles.descText}>{"2. Click on Refresh Icon."}</Text>
                                    <Text style={styles.descText}>{"3. Restart Smart bulb."}</Text>
                                    <Text style={styles.descText}>{"4. Unintstall app and reinstall again."}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableHighlight>
                </Modal>
            </View>

            <View>
                <Modal
                    visible={isRenameModalVisible}
                    animationType={'slide'}
                    onRequestClose={onRequestCloseRenameModal}
                    transparent={true}
                >
                    <TouchableHighlight
                        underlayColor={"transparent"}
                        onPress={onRequestCloseRenameModal}
                        style={styles.outerViewModalStyle}
                    >
                        <TouchableOpacity delayPressIn={0} onPress={() => null} activeOpacity={1}>
                            <View style={styles.modal}>
                                <View style={{ paddingHorizontal: 20 }}>
                                    <Text style={styles.troubleShotHelp}>{"Rename Blub"}</Text>
                                    <TextInput
                                        value={renameValue}
                                        onChangeText={(text) => setRenameValue(text)}
                                        placeholder='Enter Name'
                                        maxLength={19}
                                        placeholderTextColor={"gray"}
                                        style={styles.renameTextInput}
                                    />
                                    <TouchableOpacity style={styles.button}
                                        onPress={onPressRenameDevice}
                                    >
                                        <Text style={styles.textInput}>
                                            {"Rename"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableHighlight>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        paddingVertical: 30
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    outerViewModalStyle: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
    },
    modal: {
        backgroundColor: "white",
        borderRadius: 10,
        marginHorizontal: 20,
        // marginHorizontal: 10
        paddingBottom: 20
    },
    emptyMainView: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: "100%"
    },
    scanningText: {
        color: "black",
        fontSize: 16
    },
    noBlubText: {
        color: "black",
        fontWeight: "600",
        fontSize: 16,
        textAlign: "center"
    },
    pleaseMakeText: {
        color: "black",
        fontWeight: "400",
        fontSize: 14,
        marginTop: 20,
        textAlign: "center"
    },
    touubleShootHelp: {
        color: "blue",
        fontWeight: "600",
        fontSize: 16,
        marginTop: 30,
        textAlign: "center"
    },
    descText: {
        color: "black",
        fontWeight: "400", fontSize: 14,
    },
    troubleShotHelp: {
        color: "blue",
        fontWeight: "600",
        fontSize: 16,
        marginVertical: 15,
        textAlign: "center"
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
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    bulbWrapView: {
        marginHorizontal: 20, flexDirection: "row",
        alignItems: "center", marginVertical: 10,
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "gray",
        paddingBottom: 5,
    },
    smartBlubIcon: {
        height: 30,
        width: 30
    },
    bulbText: {
        color: "black",
        marginLeft: 20
    },
    activityindicator: {
        position: "absolute",
        right: "30%"
    },
    ranameView: {
        backgroundColor: "blue",
        padding: 5
    },
    renameText: {
        fontSize: 14,
        color: "white"
    },
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    contentContainerStyle: {
        flexGrow: 1,
        backgroundColor: "white"
    },
    scamWrapView: {
        position: "absolute", bottom: 10,
        flexDirection: "row", justifyContent: "space-between",
    },
    startScanView: {
        alignItems: "center",
        width: "50%"
    },
    refreshIcon: {
        height: 30,
        width: 30,
    },
    refreshText: {
        fontSize: 16, fontWeight: "700", color: "black"
    },
    renameTextInput: {
        borderWidth: 1,
        color: "black", margin: 10,
        height: 50
    },
    bulbView: {
        flexDirection: "row",
        alignItems: "center",
    }
});

export default BletoothMainScreen;