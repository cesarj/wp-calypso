/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import FakeData from './fake-data';
import LineChart from 'components/line-chart';
import SectionHeader from 'components/section-header';
import { changeGoogleMyBusinessStatsInterval } from 'state/google-my-business/actions';
import { getInterval } from 'state/google-my-business/selector';
import { getSelectedSiteId } from 'state/ui/selectors';

class GoogleMyBusinessStatsChart extends Component {
	static propTypes = {
		changeGoogleMyBusinessStatsInterval: PropTypes.func.isRequired,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
		data: PropTypes.array.isRequired,
		dataSeriesInfo: PropTypes.object,
		description: PropTypes.string,
		interval: PropTypes.oneOf( [ 'week', 'month', 'quarter' ] ),
		siteId: PropTypes.number.isRequired,
		statType: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		renderTooltipForDatanum: PropTypes.func,
	};

	static defaultProps = {
		dataSeriesInfo: {},
	};

	constructor( props ) {
		super( props );

		this.state = {
			transformedData: this.transformData( props.data ),
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.data !== nextProps.data ) {
			this.setState( {
				transformedData: this.transformData( nextProps.data ),
			} );
		}
	}

	shouldComponentUpdate( nextProps ) {
		//@TODO: Once the data comes from redux, re-evaluate the need for deep equal
		return (
			this.props.interval !== nextProps.interval || ! isEqual( this.props.data, nextProps.data )
		);
	}

	transformData( data ) {
		// return data.map( value => ( {
		// 	value: value.dimensionalValues.value,
		// 	description: get( this.props.dataSeriesInfo, `${ value.metric }.description`, '' ),
		// 	name: get( this.props.dataSeriesInfo, `${ value.metric }.name`, value.metric ),
		// } ) );
		return data.map( dataSeries => {
			return dataSeries.dimensionalValues.map( datum => {
				return {
					date: Date.parse( datum.time ),
					value: datum.value,
				};
			} );
		} );
	}

	onIntervalChange = event =>
		this.props.changeGoogleMyBusinessStatsInterval(
			this.props.siteId,
			this.props.statType,
			event.target.value
		);

	render() {
		const { chartTitle, description, interval, title } = this.props;
		const { transformedData } = this.state;
		return (
			<div>
				<SectionHeader label={ title } />
				<Card>
					{ description && (
						<div>
							<CardHeading tagName={ 'h2' } size={ 16 }>
								{ description }
							</CardHeading>
							<hr className="gmb-stats__metric-hr" />
						</div>
					) }
					<select value={ interval } onChange={ this.onIntervalChange }>
						<option value="week">{ 'Week' }</option>
						<option value="month">{ 'Month' }</option>
						<option value="quarter">{ 'Quarter' }</option>
					</select>
					<div className="gmb-stats__metric-chart">
						<LineChart
							fillArea
							data={ transformedData }
							renderTooltipForDatanum={ this.props.renderTooltipForDatanum }
						/>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const interval = getInterval( state, siteId, ownProps.statType );
		return {
			siteId,
			interval,
			data: FakeData.statFunction( ownProps.statType, interval ),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
	}
)( GoogleMyBusinessStatsChart );
