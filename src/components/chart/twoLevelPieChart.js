import react, { Component } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Sector } from 'recharts';
import { renderActiveShape } from './shapes';

class TwoLevelPieChart extends Component{
  constructor(props){
    super(props);

    this.state = {
      activeIndex: 0,
    };

  }

  onPieEnter(data, index) {
    this.setState({
      activeIndex: index,
    });
  }

	render () {
    const { activeIndex } = this.state;
    const { data, width, height, fill } = this.props;
  	return (
    	<PieChart width={width} height={height}>
        <Pie
        	activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          innerRadius={100}
          outerRadius={130}
          fill={fill}
          onMouseEnter={::this.onPieEnter}
        />
       </PieChart>
    );
  }

};

TwoLevelPieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  fill:  PropTypes.string,
};

TwoLevelPieChart.defaultProps = {
  data: [],
  width: 200,
  height: 200,
  fill: '#368FE9',
};

export default TwoLevelPieChart;
