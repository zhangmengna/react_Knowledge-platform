module.exports = {
    entry: {
        vendor: ['antd'],    // 需要分离的库
        //charts: ['echarts-for-react'],
        //analyze:['./src/componentsDiy/aervice_detective/servive/common/analyze.jsx'],
        //monitor:['./src/componentsDiy/aervice_detective/servive/common/detective-quality-monitor.jsx'],
        //statistics:['./src/componentsDiy/aervice_detective/servive/common/detective-quality-statistics.jsx']
        search:['./src/components/modules/searchCom/search.jsx'],
        addTag:['./src/components/modules/addTag/addTag.jsx'],
        tag:['./src/components/modules/tag/tags.jsx']
    }
}; 