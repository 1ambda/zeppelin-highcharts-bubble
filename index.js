import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'

import Highcharts from 'highcharts/highcharts'
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);

export default class BubbleChart extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config)

        this.props = [
            { name: 'xAxis', },
            { name: 'yAxis', },
            { name: 'zAxis', },
            { name: 'category', },
        ]

        this.transformation = new ColumnselectorTransformation(
            config, this.props)
    }

    /**
     * @param tableData {Object} includes cols and rows. For example,
     *                           `{columns: Array[2], rows: Array[11], comment: ""}`
     *
     * Each column includes `aggr`, `index`, `name` fields.
     *  For example, `{ aggr: "sum", index: 0, name: "age"}`
     *
     * Each row is an array including values.
     *  For example, `["19", "4"]`
     */
    render(tableData) {
        const conf = this.config

        /** can be rendered when all axises are defined */
        if (!conf.xAxis || !conf.yAxis || !conf.zAxis || !conf.category) {
            return
        }

        const rows = tableData.rows

        const [ xAxisName, xAxisIndex, ] = [ conf.xAxis.name, conf.xAxis.index, ]
        const [ yAxisName, yAxisIndex, ] = [ conf.yAxis.name, conf.yAxis.index, ]
        const [ zAxisName, zAxisIndex, ] = [ conf.zAxis.name, conf.zAxis.index, ]
        const [ categoryName, categoryIndex, ] = [ conf.category.name, conf.category.index, ]

        const data = createDataStructure(xAxisIndex, yAxisIndex, zAxisIndex, categoryIndex, rows)
        const chartOption = createHighchartOption(xAxisName, yAxisName, zAxisName, categoryName, data);

        Highcharts.chart(this.targetEl[0].id, chartOption);
    }

    getTransformation() {
        return this.transformation
    }
}

/**
 * creates data structure by converting Zeppelin tabledata.rows
 *
 * @return {Array<Object>}
 *
 * See also: * http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/bubble/
 */
export function createDataStructure(xAxisIndex, yAxisIndex, zAxisIndex,
                                    categoryIndex, rows) {
    const data = []
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const xAxisValue = parseFloat(row[xAxisIndex])
        const yAxisValue = parseFloat(row[yAxisIndex])
        const zAxisValue = parseFloat(row[zAxisIndex])
        const categoryValue = row[categoryIndex]

        data.push({
            x: xAxisValue,
            y: yAxisValue,
            z: zAxisValue,
            _category: categoryValue, /** highchart doens't allow `category` variable in row */
        });
    }

    return data
}

export function createHighchartOption(xAxisName, yAxisName, zAxisName,
                                      categoryName, data) {
    return {
        chart: {
            type: 'bubble',
            plotBorderWidth: 1,
            zoomType: 'xy'
        },

        title: { text: '' },

        xAxis: {
            gridLineWidth: 1,
            title: { text: xAxisName, },
        },

        yAxis: {
            startOnTick: false,
            endOnTick: false,
            title: { text: yAxisName, },
            maxPadding: 0.2,
        },

        tooltip: {
            useHTML: true,
            headerFormat: '<table>',
            pointFormat: '<tr><th colspan="2"><h3>{point._category}</h3></th></tr>' +
            `<tr><th>${xAxisName}:</th><td>{point.x}</td></tr>` +
            `<tr><th>${yAxisName}:</th><td>{point.y}</td></tr>` +
            `<tr><th>${zAxisName}:</th><td>{point.z}</td></tr>`,
            footerFormat: '</table>',
            followPointer: true
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point._category}'
                }
            }
        },

        series: [{ name: zAxisName, data: data, }]
    }
}
