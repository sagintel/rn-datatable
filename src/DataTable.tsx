import React from 'react';
import {View, ScrollView} from 'react-native';
import DataTableRow from './DataTableRow';
import DataTableFooter from './DataTableFooter';
import DataTableHeader from './DataTableHeader';
import sortData from '../functions/sort';
import showCurrentProgress from '../functions/showCurrentProgress';

export const COL_TYPES = {
    INT: 'INT',
    STRING: 'STRING'
}

const TOTAL_WIDTH = 100;

interface PropTypes {
    data?: object[];
    colNames?: string[];
    colSettings?: object[];
    noOfPages?: number;
    onRowSelect?: (anyVariable) => object;
    backgroundColor?: string;
    doSort?: boolean;
    stickyHeader?: boolean;
    headerLabelStyle?: object;
}

class DataTable extends React.Component<PropTypes> {
    state = {
        snap: null,
        data: [], //[{...}, {...}, ....]
        displayData: [], //currentlyDisplayData
        colNames: [],//['ad', 'asd', ...]
        defaultEachColumnWidth: '50%',
        eachColWidth: {}, // {columnName: '25%'}
        widthOfContainer: 0,
        isSortedAssending: { recentlySortedCol: null }, //ColName: true||false
        startDataArray: [],//[{id: startData}]
        endDataArray: [], //[{id, endData}]
        noOfPages: 3, //default
        activeDisplayDataId: 0,
        mapColNameToType: {},
    }


    handleColPress = name => {
        const newData = [...this.state.displayData];

        const { recentlySortedCol } = this.state.isSortedAssending

        if (recentlySortedCol == name) {
            // Here we want to sort based on previus col State
            const data = sortData(newData, this.state.isSortedAssending[name], name)
            this.setState(state => ({
                displayData: newData,
                isSortedAssending: {
                    ...state.isSortedAssending,
                    [name]: data.setIsSortedAsc,
                    recentlySortedCol: name
                }
            }))
        } else {
            // Here we want to sort always in ascending Order
            const data = sortData(newData, this.state.isSortedAssending[name], name, true)
            this.setState(state => ({
                displayData: newData,
                isSortedAssending: {
                    ...state.isSortedAssending,
                    [name]: data.setIsSortedAsc,
                    recentlySortedCol: name
                }
            }))
        }
    }

    handleOnRowSelect = (id) => {
        const data = this.state.data.map(row => {
            if (row.id != id) return row;
            if ('onRowSelect' in this.props) this.props?.onRowSelect({ ...row}) // Sending props
            return { ...row}
        })

        const displayData = this.state.displayData.map(row => {
            if (row.id != id) return row;
            return { ...row}
        })

        this.setState({
            data,
            displayData
        })
    }

    handleNextPreviousPagePress = (type) => {//next | back
        if (type == 'next') {
            // this.state.activeDisplayDataId
            const activeDisplayId = this.state.activeDisplayDataId;
            const endObj = this.state.endDataArray.find(obj => obj.id == activeDisplayId + 1);
            const startObj = this.state.startDataArray.find(obj => obj.id == activeDisplayId + 1);

            this.setState({
                displayData: this.state.data.slice(startObj?.startData - 1, endObj?.endData),
                activeDisplayDataId: activeDisplayId + 1
            });

        } else if (type == 'back') {
            const activeDisplayId = this.state.activeDisplayDataId;
            const endObj = this.state.endDataArray.find(obj => obj.id == activeDisplayId - 1);
            const startObj = this.state.startDataArray.find(obj => obj.id == activeDisplayId - 1);

            this.setState({
                displayData: this.state.data.slice(startObj?.startData - 1, endObj?.endData),
                activeDisplayDataId: activeDisplayId - 1
            });
        }
    }

    static getDerivedStateFromProps(props, currentState) {
        //this func() called on every setState() & on mount & on prop changes
        const snap = JSON.stringify({
            data: props.data,
            colSettings: props.colSettings,
            colNames: props.colNames,
            noOfPages: props.noOfPages,
        })

        if (snap == currentState.snap) return null;

        //Here below code means that data prop is changed
        let data = props?.data
        let colNames = props?.colNames;

        if (typeof (data) != 'object') {
            data = [];
        }
        if (typeof (colNames) != 'object') {
            colNames = ['No Columns'];
        }

        const mapColNameToType = {}
        const eachColWidth = {}
        props.colSettings?.forEach(setting => {
            if (!colNames.includes(setting.name)) throw new Error('No Column exists which mentioned in provided colSettings prop Name!')
            mapColNameToType[setting.name] = setting?.type;
            eachColWidth[setting.name] = setting?.width;
        })
        let start = [];
        let end = []
        if (data.length != 0) {
            const progress = showCurrentProgress(props?.noOfPages, data?.length) //[{id, endData}]
            if (progress) {
                start = progress.start;
                end = progress.end;
            }
        }

        const noOfCols = colNames.length;
        const isSortedAssending = {};
        colNames.forEach(name => {
            isSortedAssending[name] = false;
        })

        const modifiedData = data.map((row, index) => {
            if (!row.id) return { ...row, id: index }
            return row;
        })
        return {
            snap: snap,
            data: modifiedData,
            displayData: modifiedData.slice(0, end[0]?.endData),
            colNames: [...colNames],
            defaultEachColumnWidth: TOTAL_WIDTH / noOfCols + '%',
            eachColWidth: eachColWidth,
            isSortedAssending: { ...currentState.isSortedAssending, ...isSortedAssending },
            activeDisplayDataId: 0, //by default it's zero
            startDataArray: start,
            endDataArray: end,
            mapColNameToType
        };
    }

    renderItem = (item, index) => {
        return (
            <DataTableRow
                handleOnRowSelect={this.handleOnRowSelect}
                key={index}
                index={index}
                data={item}
                mapColNameToType={this.state.mapColNameToType}
                colNames={this.state.colNames}
                eachColWidth={this.state.eachColWidth}
                defaultEachColumnWidth={this.state.defaultEachColumnWidth}
            />
        );
    }

    render() {
        return (
            <View
                onLayout={e => this.setState({ widthOfContainer: e.nativeEvent.layout.width })}
                style={{flex: 1, backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#e4edec'}}>
                <ScrollView
                    nestedScrollEnabled={true}
                    bounces={false}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    <ScrollView
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        stickyHeaderIndices={this.props?.stickyHeader === false ? [] : [0]}>
                        <DataTableHeader
                            colNames={this.state.colNames}
                            mapColNameToType={this.state.mapColNameToType}
                            defaultEachColumnWidth={this.state.defaultEachColumnWidth}
                            eachColWidth={this.state.eachColWidth}
                            handleColPress={this.handleColPress}
                            doSort={this.props?.doSort}
                            style={this.props?.headerLabelStyle}
                            backgroundColor={this.props.backgroundColor ? this.props.backgroundColor : '#e4edec'}
                        />
                        {this.state.displayData.map((item, index) => {
                            return this.renderItem(item, index);
                        })}
                    </ScrollView>
                </ScrollView>
                <DataTableFooter
                    start={this.state.startDataArray}
                    end={this.state.endDataArray}
                    activeDataId={this.state.activeDisplayDataId}
                    dataLength={this.state.data.length}
                    handleNextPreviousPagePress={this.handleNextPreviousPagePress}
                />
            </View>
        );
    }
}

export default DataTable;
