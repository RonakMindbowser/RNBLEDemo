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

    FlatList,
    TouchableOpacity,
    Switch,
    ToastAndroid,
} from 'react-native';

import BleManager from "react-native-ble-manager";
import { ColorPicker, toHsv, fromHsv, } from 'react-native-color-picker';
import { hexToRgb, } from '../Utils/Utils';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { CustomHeader, } from "react-native-reusable-custom-components";
import { useNavigation, useRoute } from '@react-navigation/native';
import { colorAndShadeList1 } from './ColorList';

/**
 * BLE Device Service Class
 * @param {*} props 
 * @returns 
 */
const BLEDeviceService = (props) => {
    const navigation = useNavigation();
    const route = useRoute();

    const [currentIndex, setIndex] = useState(0)
    const [randomNumber, setRandom] = useState(Date.now())
    const [blubName, setBlubName] = useState("")

    const [lastColor, setLastColor] = useState("");
    const [serviceAndCharList, setServiceAndCharList] = useState([]);
    const [isServiceAndCharAvailable, setAvaibility] = useState(false);
    const [selectedColorFromPicker, setPickerColor] = useState("#FF0000");
    const [isEnabled, setEnabled] = useState(true)

    const serviceUUIDForWriteBlubColor = "ffb0"
    const characteristicUUIDForWriteBlubColor = "ffb2"
    const characteristicUUIDForChangeBlubName = "ffb7"
    const fullBrightNessHexValue = 49; // 1
    const zeroBrightNessHexValue = 48; // 0

    const colorAndShadeList = colorAndShadeList1

    useEffect(() => {
        const ble3 = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        const ble4 = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

        //* Get the All services from Periheral
        getAllServiceForBLEDevice()

        return (() => {
            ble3.remove()
            ble4.remove()
        })

    }, []);

    const handleDisconnectedPeripheral = (data) => {
        alert("BLE Device is Disconnected")
        navigation.goBack()
    }

    /**
     //* Get the All services from Periheral
     */
    const getAllServiceForBLEDevice = () => {
        let item = route.params && route.params.peripheral ? route.params.peripheral : null
        var tempdata = [];

        /**
         //* Retrieve services and characteristic from Periheral
         //*@param id of Periheral
        */
        BleManager.retrieveServices(item.id).then((res1) => {
            console.log("Res1===>", res1);
            let data = res1.characteristics;
            var seen = {};
            tempdata = data.filter(function (entry) {
                var previous;

                // Have we seen this service before?
                if (seen.hasOwnProperty(entry.service)) {
                    // Yes, grab it and add this data to it
                    previous = seen[entry.service];
                    previous.characteristicList.push({
                        characteristic: entry.characteristic,
                        properties: entry.properties,
                    });

                    // Don't keep this entry, we've merged it into the previous one
                    return false;
                }

                // entry.data probably isn't an array; make it one for consistency
                if (!Array.isArray(entry.characteristicList)) {
                    entry.characteristicList = [{
                        characteristic: entry.characteristic,
                        properties: entry.properties,
                    }];
                }

                // Remember that we've seen it
                seen[entry.service] = entry;
                delete entry.characteristic;
                delete entry.properties;
                delete entry.descriptors;
                // Keep this one, we'll merge any others that match into it
                return true;
            });
            console.log("tempdata-0----->", tempdata);
            setServiceAndCharList(tempdata)

            /**
             *//* Check and find if required Service is available in all
*  retrieved services list to Perform operation
*/
            let isListContainBlubChangeColorService = tempdata.filter((obj) => obj.service == serviceUUIDForWriteBlubColor);
            console.log("isListContainBlubChangeColorService---->", isListContainBlubChangeColorService);

            if (isListContainBlubChangeColorService.length > 0) {
                /**
                *//* Check and find if required Characteristic is available in all
                *  retrieved characteristic list to Perform operation
                */
                let isListContainBlubChangeColorChar = isListContainBlubChangeColorService[0].characteristicList.filter((obj) => obj.characteristic == characteristicUUIDForWriteBlubColor);
                console.log("isListContainBlubChangeColorChar---->", isListContainBlubChangeColorChar);
                if (isListContainBlubChangeColorChar.length) {
                    setAvaibility(true)
                }
                else {
                    setAvaibility(false)
                }
            }
            else {
                setAvaibility(false)
            }

            function getCharCodes(s) {
                let charCodeArr = [];

                for (let i = 0; i < s.length; i++) {
                    let code = s.charCodeAt(i);
                    charCodeArr.push(code);
                }

                return charCodeArr;
            }

            /**
             *//* Read operation to get blub name
    */
            BleManager.read(item.id, serviceUUIDForWriteBlubColor, characteristicUUIDForChangeBlubName).then((characteristic) => {
                /**
                 *//* From library we are getting byte array so we need to convert into Human readable format.
         */
                const bytesString = String.fromCharCode(...characteristic)
                setBlubName(bytesString)
            }).catch((error) => {
                console.log("Error--write name->", error);
            })

        }).catch((err) => {
            console.log("err-->", err);
        })
    }

    const handleUpdateValueForCharacteristic = (data) => {
        console.log("Data---->Received--->", data);
    }

    const renderColorTitleItem = (item, index) => {
        // const renderColorTitleItem = ({ item, index }) => {
        return (
            <TouchableOpacity style={styles.titleView}
                onPress={() => {
                    setIndex(index)
                }}
            >
                <Text style={styles.title}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    const renderColorItem = ({ item, index }) => {
        return (
            <TouchableOpacity style={{
                borderWidth: 0.5,
                flexDirection: "row",
                paddingVertical: 10,
                paddingHorizontal: 10,
                alignItems: "center",
                marginVertical: 5
            }}
                onPress={() => {
                    onColorPicked(item.backgroundColor)
                }}
            >
                <View style={{
                    backgroundColor: item.backgroundColor,
                    height: 30, width: 30,
                    borderRadius: 30 * 2,
                    borderWidth: 2,
                    elevation: 5,
                    marginHorizontal: 10
                }} />
                <Text style={styles.colorName}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    /**
     * //* method called when color is selected
     * @param {*} color 
     */
    const onColorPicked = (color) => {

        /**
         * //*Checking if service is available or not
         */
        if (isServiceAndCharAvailable) {
            let item = route.params && route.params.peripheral ? route.params.peripheral : null
            /**
             * handle HEX to RGB color conversion
             */
            let hexToRgbValue = hexToRgb(color)
            let { r, g, b } = hexToRgbValue

            /**
             * Required data to perform write operation
             */
            let tempObj = {
                id: item.id,
                name: item.name,
                service: serviceUUIDForWriteBlubColor,
                characteristic: characteristicUUIDForWriteBlubColor,
                writeValueData: [fullBrightNessHexValue, r, g, b]
                // writeValueData: [fullBrightNessHexValue, r, g, b]
            }
            setLastColor(color)
            readAndWriteData(tempObj)
        }
        else {
            ToastAndroid.show("Blub change color service is not available.", ToastAndroid.SHORT)
        }
    }

    /**
     * 
     * //* Here we are reading and writing the data 
     * 
     * @param {*} peripheral 
     * @param {*} isRead 
     * @param {*} isToggleBlub 
     */
    const readAndWriteData = (peripheral, isRead, isToggleBlub) => {
        /**
         *//* Again checking that BLE peripheral is connected or not
*/
        BleManager.isPeripheralConnected(peripheral.id, []).then((res) => {
            if (res == false) {
                /**
                 * //*method to connect the peripheral with our app
                 */
                BleManager.connect(peripheral.id)
                    .then((res7) => {
                        // Success code
                        if (isRead) readCharData(peripheral)
                        else writeCharData(peripheral, isToggleBlub)
                    })
                    .catch((error) => { console.log("error---456464454->", error); });
            }
            else {
                if (isRead) readCharData(peripheral)
                else writeCharData(peripheral, isToggleBlub)
            }
        }).catch((error) => { console.log("Error--->", error) })
    }

    const readCharData = (peripheral) => {
        setBleValue("")
        BleManager.read(peripheral.id, peripheral.service, peripheral.characteristic).then((characteristic) => {
            const bytesString = String.fromCharCode(...characteristic)
            let bytesView = new Uint8Array(characteristic);
            let str = new TextDecoder().decode(bytesView);
            setBleValue(bytesString)
        }).catch((error) => {
            console.log("error--read error-->", error);
        });
    }

    /**
     * Here we are performing the Write operation
     * @param {*} peripheral 
     * @param {*} isToggleBlub 
     */
    const writeCharData = (peripheral, isToggleBlub) => {

        try {
            BleManager.write(peripheral.id,
                peripheral.service,
                peripheral.characteristic,
                peripheral.writeValueData	// [48, 0, 0, 0]	//	tempBuffer
            ).then((response) => {
                if (isToggleBlub == "1") {
                    ToastAndroid.show("Blub is now Turned On", ToastAndroid.SHORT)
                }
                else if (isToggleBlub == "2") {
                    ToastAndroid.show("Blub is now Turned Off", ToastAndroid.SHORT)
                }
                else {

                }
            }).catch(error => {
                console.log("Error--->", error);
                ToastAndroid.show(JSON.stringify(error), ToastAndroid.SHORT)
            })
        } catch (error) {
            console.log("Error---123123123-<", error);
        }
    }

    /**
     * Here we are performing the Blub Turn on/off operation
     * @param {*} value 
     */
    const handleBlubToggleValue = (value,) => {
        let item = route.params && route.params.peripheral ? route.params.peripheral : null

        if (value) {
            let hexToRgbValue = hexToRgb(lastColor ? lastColor : "#FFFFFF")
            let { r, g, b } = hexToRgbValue

            let tempObj = {
                id: item.id,
                name: item.name,
                service: serviceUUIDForWriteBlubColor,
                characteristic: characteristicUUIDForWriteBlubColor,
                writeValueData: [fullBrightNessHexValue, r, g, b]
                // writeValueData: [fullBrightNessHexValue, 255, 255, 255]
            }
            readAndWriteData(tempObj, false, "1")
        }
        else {
            let tempObj = {
                id: item.id,
                name: item.name,
                service: serviceUUIDForWriteBlubColor,
                characteristic: characteristicUUIDForWriteBlubColor,
                writeValueData: [zeroBrightNessHexValue, 0, 0, 0]
            }
            readAndWriteData(tempObj, false, "2")
        }
        setEnabled(value)
    }

    return (
        <View style={styles.container}>
            <CustomHeader
                backButton
                middleText={blubName ? `${blubName}` : 'BLE Device Services'}
                onBackButtonPress={() => navigation.goBack()}
            />

            <ScrollView
                horizontal
                contentContainerStyle={{ paddingTop: 20, }}
            >
                {colorAndShadeList.map((item, index) => renderColorTitleItem(item, index))}
            </ScrollView>

            {currentIndex != 0 ? <FlatList
                data={colorAndShadeList[currentIndex].colorList}
                extraData={randomNumber}
                renderItem={renderColorItem}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10, height: "60%" }}
            /> :
                <View style={{ height: "70%", marginBottom: 30 }}>
                    <ColorPicker
                        onColorSelected={color => {
                            onColorPicked(color)
                        }}
                        style={{ flex: 1 }}
                        hideControls
                        hideSliders
                        onColorChange={selectedColor => {
                            let temp2 = fromHsv({
                                h: selectedColor.h,
                                s: selectedColor.s,
                                v: selectedColor.v
                            })
                            setPickerColor(temp2)
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            onColorPicked(selectedColorFromPicker)
                        }}
                        style={[styles.titleView, { width: 200, alignSelf: "center" }]}
                    >
                        <Text style={styles.title}>{"Select"}</Text>
                    </TouchableOpacity>
                </View>
            }

            <View style={{
                position: "absolute",
                right: 0,
                top: 20
            }}>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => handleBlubToggleValue(value)}
                    value={isEnabled}
                />
            </View>
        </View>
    )
}

export default BLEDeviceService;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    titleView: {
        borderWidth: 1,
        backgroundColor: "blue",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10,
        paddingHorizontal: 10,
        borderRadius: 10
    },
    title: {
        color: "white",
        fontSize: 14,
    },
    colorName: {
        color: "black",
    }
})