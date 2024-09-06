import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { COL_TYPES } from './DataTable';
// import CheckBox from './CheckBox';

const DataTableRow = React.memo((props) => {

    //data is object
    const { data, colNames, defaultEachColumnWidth, mapColNameToType, handleOnRowSelect, eachColWidth} = props;

    let color = '#fff';
    let backgroundColor = 'transparent';
    if (data.doHighlight && data.doHighlight != 'default') {
        color = typeof (data.doHighlight) != 'string' && (data.doHighlight?.textColor); //textColor
        backgroundColor = typeof (data.doHighlight) == 'string' ? data.doHighlight : data.doHighlight?.backgroundColor;
    } else if (data.doHighlight && data.doHighlight === 'default') {
        color = 'white';
        backgroundColor = '#990099';
    }
    return (
        <>
            <View style={[styles.rowContainer,{ backgroundColor:"#070316"}]}>
                {
                    colNames.map((name, index) => {
                        const colWidth = eachColWidth[name] == undefined ? defaultEachColumnWidth : eachColWidth[name];
                        const colType = mapColNameToType[name]
                        const textAlign = (colType == COL_TYPES.STRING || colType == null) ? 'left' : (colType == COL_TYPES.CHECK_BOX || colType == COL_TYPES.RADIO) ? 'center' : 'right'
                        let paddingLeft = 0;
                        let paddingRight = 0;
                        if (textAlign == 'left') {
                            paddingRight = 1;
                            paddingLeft = 13
                        } else if (textAlign == 'right') {
                            paddingRight = 13;
                            paddingLeft = 1;

                        }

                        const initialVal = data[name] == true ? true : false

                        return (
                            <TouchableOpacity onPress={handleOnRowSelect?.bind(null,data.id)} key={index} style={[styles.rowCellContainer, { width: colWidth,backgroundColor: "transparent"}]}>
                                {/* {
                                    textAlign == 'center' ? (
                                        <View style={{ width: '100%', height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <CheckBox info={{ name, id: data.id }} handleOnRowSelect={handleOnRowSelect}  />
                                        </View>
                                    ) : ( */}
                                        <Text style={[styles.rowCellText, { paddingLeft, paddingRight, textAlign, color:"white",fontSize:14 },{ tintColor: 'white'}]}>{data[name]}</Text>
                                    {/* )
                                } */}
                            </TouchableOpacity>

                        );
                    })
                }
            </View>
        </>
    );
})

export default DataTableRow;

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        borderBottomWidth: 0.4,
        borderBottomColor: '#e3e3e3',
        backgroundColor:"transparent"
    },
    rowCellText: {
        color: 'white',
        fontSize: 14.5
    },
    rowCellContainer: {
        paddingTop: 10,
        backgroundColor:"transparent",
        paddingBottom: 10,
    }
});

