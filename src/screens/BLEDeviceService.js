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
    Modal,
} from 'react-native';

import BleManager from "react-native-ble-manager";
import { ColorPicker, toHsv, fromHsv, } from 'react-native-color-picker';
import {
    BEAUTIFUL, BRIGHT, getEffectRGBData, getEffectsData, getSystemTime,
    getTimerBytes, hexToRgb, MOONLIGHT, NO_EFFECTS, OLD_RGBW_TYPE, POWER_SWITCH, READING, WARM,
} from '../Utils/Utils';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { CustomHeader, } from "react-native-reusable-custom-components";
import { useNavigation, useRoute } from '@react-navigation/native';
import { colorAndShadeList1 } from './ColorList';
import DatePicker from 'react-native-date-picker'

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

    const [isEffectRunning, setEffectRunning] = useState(false);

    const [isTurnOnEnabled, setIsTurnOnEnabled] = useState(false)
    const [isTurnOffEnabled, setIsTurnOffEnabled] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [date, setDate] = useState(new Date(new Date().getTime() + 2 * 60000))

    const [turnOnDate, setTurnOnDate] = useState(date)
    const [turnOffDate, setTurnOffDate] = useState(date)
    const [alarmIndex, setAlarmIndex] = useState(0)
    const [selectedMode, setMode] = useState(0);
    const [selectedModeValue, setModeValue] = useState("BRIGHT");

    const [modeList1, setList1] = useState([{
        id: BRIGHT,
        value: "BRIGHT"
    },
    {
        id: MOONLIGHT,
        value: "MOONLIGHT"
    },
    {
        id: READING,
        value: "READING"
    }])

    const [modeList2, setList2] = useState([{
        id: OLD_RGBW_TYPE,
        value: "OLD_RGBW_TYPE"
    },
    {
        id: WARM,
        value: "WARM"
    },
    {
        id: BEAUTIFUL,
        value: "BEAUTIFUL"
    }])

    const serviceUUIDForWriteBlubColor = "ffb0"
    const characteristicUUIDForWriteBlubColor = "ffb2"

    const LED_RW_R_ARRAY_CHARACTERISTIC_UUID = "ffb9";
    const LED_RW_G_ARRAY_CHARACTERISTIC_UUID = "ffba";
    const LED_RW_B_ARRAY_CHARACTERISTIC_UUID = "ffbb";
    const LED_RW_CHANGE_MODE_CHARACTERISTIC_UUID = "ffb1";
    const LED_RW_TIMING_CHARACTERISTIC_UUID = "ffbf";
    const LED_RW_SYSTEM_TIME_CHARACTERISTIC_UUID = "ffb3";

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
        let isRomanceEffect = colorAndShadeList[currentIndex]?.isRomanceEffect ? true : false;
        return (
            <TouchableOpacity style={styles.colorItemView}
                onPress={() => {
                    if (isRomanceEffect) {
                        onRomanceEffectClick(item)
                    }
                    else {
                        onColorPicked(item.backgroundColor)
                    }
                }}
            >
                <View style=
                    {{
                        backgroundColor: item.backgroundColor,
                        ...styles.itemColorView
                    }}
                />
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

    const getValue = (list = []) => {
        let newlist = list.map(obj => parseInt(obj, 16));
        return newlist
    }

    const onRomanceEffectClick = (data) => {
        let item = route.params && route.params.peripheral ? route.params.peripheral : null;
        console.log("Effect Name ---->", data?.name);

        let rgbData = getEffectRGBData(data.name)
        console.log("rgbData : ", rgbData);

        let effectData = getEffectsData(data.name)
        console.log("effectData : ", effectData);

        let noEffectData = getEffectsData(NO_EFFECTS);
        console.log("noEffectData : ", noEffectData);

        if (rgbData?.length) {
            BleManager.write(item.id,
                serviceUUIDForWriteBlubColor,
                LED_RW_CHANGE_MODE_CHARACTERISTIC_UUID,
                noEffectData
            ).then((res) => {
                console.log("res----NO_EFFECTS<", res);
                setTimeout(() => {
                    BleManager.write(item.id,
                        serviceUUIDForWriteBlubColor,
                        LED_RW_R_ARRAY_CHARACTERISTIC_UUID,
                        rgbData[0]).then((res) => {
                            console.log("res---LED_RW_R_ARRAY_CHARACTERISTIC_UUID-<", res);
                            BleManager.write(item.id,
                                serviceUUIDForWriteBlubColor,
                                LED_RW_G_ARRAY_CHARACTERISTIC_UUID,
                                rgbData[1]).then((res) => {
                                    console.log("res---LED_RW_G_ARRAY_CHARACTERISTIC_UUID-<", res);
                                    BleManager.write(item.id,
                                        serviceUUIDForWriteBlubColor,
                                        LED_RW_B_ARRAY_CHARACTERISTIC_UUID,
                                        rgbData[2]).then((res) => {
                                            console.log("res---LED_RW_B_ARRAY_CHARACTERISTIC_UUID-<", res);
                                            BleManager.write(item.id,
                                                serviceUUIDForWriteBlubColor,
                                                LED_RW_CHANGE_MODE_CHARACTERISTIC_UUID,
                                                effectData).then((res) => {
                                                    console.log("res---LED_RW_CHANGE_MODE_CHARACTERISTIC_UUID-<", res);
                                                }).catch((error) => {
                                                    console.log("Error---1234-<", error);
                                                })
                                        }).catch((error) => {
                                            console.log("Error---1234-<", error);
                                        })
                                }).catch((error) => {
                                    console.log("Error---58585-<", error);
                                })
                        }).catch((error) => {
                            console.log("Error---4848-<", error);
                        })
                }, 500);
            }).catch((error) => {
                console.log("Error---no effect-<", error);
            })
        }
    }

    const handleAlarmTurnOnValue = (value) => {
        // setIsTurnOnEnabled(value)
        setModalVisible(true)
        setAlarmIndex(0)
    }

    const handleAlarmTurnOffValue = (value) => {
        // setIsTurnOffEnabled(value)
        setModalVisible(true)
        setAlarmIndex(1)
    }

    const performTurnOnOffOperation = () => {
        setModalVisible(false)
        if (alarmIndex == 0) setIsTurnOnEnabled(true)
        else setIsTurnOffEnabled(true)

        let hour1 = turnOnDate.getHours()
        let minutes1 = turnOnDate.getMinutes()

        let hour2 = turnOffDate.getHours();
        let minutes2 = turnOffDate.getMinutes();

        let mode = selectedMode;
        let duration = 1;

        let item = route.params && route.params.peripheral ? route.params.peripheral : null;

        let byteTimer1 = getTimerBytes({ hour: hour1, minutes: minutes1, mode, duration, isOn: true })

        let byteTimer2 = getTimerBytes({ hour: hour2, minutes: minutes2, mode: POWER_SWITCH, duration, isOn: alarmIndex == 1 })

        console.log("byteTimer1 :: ", byteTimer1);
        console.log("byteTimer2 :: ", byteTimer2);

        let value = [];
        value[0] = byteTimer1[0];
        value[1] = byteTimer1[1];
        value[2] = byteTimer1[2];
        value[3] = byteTimer1[3];
        value[4] = byteTimer1[4];
        value[5] = byteTimer1[5];
        value[6] = byteTimer1[6];
        value[7] = byteTimer1[7];
        value[8] = byteTimer1[8];
        value[9] = byteTimer2[0];
        value[10] = byteTimer2[1];
        value[11] = byteTimer2[2];
        value[12] = byteTimer2[3];
        value[13] = byteTimer2[4];
        value[14] = byteTimer2[5];
        value[15] = byteTimer2[6];
        value[16] = byteTimer2[7];
        value[17] = byteTimer2[8];
        console.log("Final Value :: ", value);

        let systemTime = getSystemTime();
        console.log("Final systemTime :: ", systemTime);

        BleManager.write(
            item.id,
            serviceUUIDForWriteBlubColor,
            LED_RW_SYSTEM_TIME_CHARACTERISTIC_UUID,
            systemTime,
        ).then((res) => {
            console.log("res LED_RW_SYSTEM_TIME_CHARACTERISTIC_UUID:: ", res);
            setTimeout(() => {
                BleManager.write(
                    item.id,
                    serviceUUIDForWriteBlubColor,
                    LED_RW_TIMING_CHARACTERISTIC_UUID,
                    value,
                ).then((res) => {
                    console.log("res LED_RW_TIMING_CHARACTERISTIC_UUID:: ", res);
                }).catch((err) => {
                    console.log("Erro LED_RW_TIMING_CHARACTERISTIC_UUID:: ", err);
                })
            }, 1000);
        }).catch((err) => {
            console.log("Erro LED_RW_SYSTEM_TIME_CHARACTERISTIC_UUID:: ", err);
        })
    }

    const renderModeView = (obj) => {
        return (
            <TouchableOpacity style={styles.listObjView}
                onPress={() => {
                    setMode(obj.id)
                    setModeValue(obj.value)
                }}
            >
                <View style={styles.radioView}>
                    {
                        selectedMode == obj.id
                            ? <View style={styles.radioSelected} /> : null
                    }
                </View>
                <Text style={styles.objValue}>{obj.value}</Text>
            </TouchableOpacity>
        )
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

            {currentIndex != 0 && currentIndex != colorAndShadeList.length - 1 ? <FlatList
                data={colorAndShadeList[currentIndex].colorList}
                extraData={randomNumber}
                renderItem={renderColorItem}
                contentContainerStyle={styles.contentContainerStyle}
            /> : currentIndex == 0 ?
                <View style={styles.colorPickerView}>
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
                :
                (
                    <View style={{ height: "70%", }}>
                        <View style={styles.switchView}>
                            <TouchableOpacity
                                style={[styles.titleView, { width: '75%', }]}
                                onPress={() => handleAlarmTurnOnValue()}
                            >
                                <Text style={styles.title}>{"Set alarm to turn on the lights"}</Text>
                            </TouchableOpacity>
                            <Switch
                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                ios_backgroundColor="#3e3e3e"
                                thumbColor={isTurnOnEnabled ? "#f5dd4b" : "#f4f3f4"}
                                onValueChange={(value) => handleAlarmTurnOnValue(value)}
                                value={isTurnOnEnabled}
                            />
                        </View>
                        <Text style={styles.turnOnDate}>{"Turn On Light time::" + turnOnDate.toString()}</Text>
                        <Text style={styles.turnOnDate}>{"Selected Mode:: " + selectedModeValue}</Text>

                        <View style={styles.switchView}>
                            <TouchableOpacity
                                style={[styles.titleView, { width: '75%', }]}
                                onPress={() => handleAlarmTurnOffValue()}
                            >
                                <Text style={styles.title}>{"Set alarm to turn on the lights"}</Text>
                            </TouchableOpacity>
                            <Switch
                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                ios_backgroundColor="#3e3e3e"
                                thumbColor={isTurnOffEnabled ? "#f5dd4b" : "#f4f3f4"}
                                onValueChange={(value) => handleAlarmTurnOffValue(value)}
                                value={isTurnOffEnabled}
                            />
                        </View>
                        <Text style={styles.turnOnDate}>{"Turn Off Light time::" + turnOffDate.toString()}</Text>
                    </View>
                )
            }

            <View style={styles.bulbTurnSwithchView}>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => handleBlubToggleValue(value)}
                    value={isEnabled}
                />
            </View>
            <View>
                <Modal
                    visible={modalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                    style={styles.modalStyle}
                >
                    <View style={styles.mainContainer}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.transparentArea}
                        />
                        <View style={styles.subContainer}>
                            <DatePicker
                                date={alarmIndex == 0 ? turnOnDate : turnOffDate}
                                onDateChange={(dt) => {
                                    if (alarmIndex == 0) setTurnOnDate(dt)
                                    else setTurnOffDate(dt)
                                }}
                                minimumDate={new Date()}
                                is24hourSource="locale"
                                mode='datetime'
                            />
                            {alarmIndex == 0 ? <View>
                                <View style={styles.listWrapView}>
                                    {modeList1.map((obj) => { return renderModeView(obj) })}
                                </View>
                                <View style={styles.listWrapView}>
                                    {modeList2.map((obj) => { return renderModeView(obj) })}
                                </View>
                            </View> : null}
                            <TouchableOpacity style={styles.titleView}
                                onPress={performTurnOnOffOperation}
                            >
                                <Text style={styles.title}>{"Select"}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.transparentArea}
                        />
                    </View>
                </Modal>
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
    },
    modalStyle: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#26323870',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transparentArea: {
        flex: 1,
        width: '100%',
    },
    subContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'space-around',
    },
    listWrapView: {
        flexDirection: "row",
        paddingVertical: 10
    },
    listObjView: {
        flexDirection: "row",
        margin: 10,
        alignItems: "center"
    },
    radioView: {
        height: 15, width: 15,
        borderWidth: 2, borderColor: "black",
        borderRadius: 30, alignItems: "center",
        justifyContent: "center"
    },
    radioSelected: {
        height: 8, width: 8,
        backgroundColor: "black", borderRadius: 20,
    },
    objValue: {
        color: "black",
        textTransform: "lowercase", marginLeft: 5
    },
    contentContainerStyle: {
        flexGrow: 1,
        paddingHorizontal: 10,
    },
    colorPickerView: {
        height: "70%",
        marginBottom: 30
    },
    turnOnDate: {
        color: "black",
        padding: 15
    },
    switchView: {
        flexDirection: "row",
        marginTop: 20
    },
    bulbTurnSwithchView: {
        position: "absolute",
        right: 0,
        top: 20
    },
    colorItemView: {
        borderWidth: 0.5,
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
        marginVertical: 5
    },
    itemColorView: {
        height: 30, width: 30,
        borderRadius: 30 * 2,
        borderWidth: 2,
        elevation: 5,
        marginHorizontal: 10
    }
})