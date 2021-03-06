/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import SectionHeader from 'components/section-header';
import {
	changeGoogleMyBusinessStatsInterval,
	requestGoogleMyBusinessStats,
} from 'state/google-my-business/actions';
import { getGoogleMyBusinessStats } from 'state/selectors';
import { getInterval } from 'state/google-my-business/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class GoogleMyBusinessStatsChart extends Component {
	static propTypes = {
		changeGoogleMyBusinessStatsInterval: PropTypes.func.isRequired,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
		data: PropTypes.array.isRequired,
		dataSeriesInfo: PropTypes.object,
		description: PropTypes.string,
		interval: PropTypes.oneOf( [ 'week', 'month', 'quarter' ] ),
		requestGoogleMyBusinessStats: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		statType: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
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

	componentDidMount() {
		this.props.requestGoogleMyBusinessStats(
			this.props.siteId,
			this.props.statType,
			this.props.interval
		);
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.data !== nextProps.data ) {
			this.setState( {
				transformedData: this.transformData( nextProps.data ),
			} );
		}

		if (
			this.props.interval !== nextProps.interval ||
			this.props.siteId !== nextProps.siteId ||
			this.props.statType !== nextProps.statType
		) {
			nextProps.requestGoogleMyBusinessStats(
				nextProps.siteId,
				nextProps.statType,
				nextProps.interval,
			);
		}
	}

	transformData( data ) {
		if ( ! data ) {
			return data;
		}

		return data.metricValues.map( value => ( {
			value: value.totalValue.value,
			description: get( this.props.dataSeriesInfo, `${ value.metric }.description`, '' ),
			name: get( this.props.dataSeriesInfo, `${ value.metric }.name`, value.metric ),
		} ) );
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
						<PieChart data={ transformedData } title={ chartTitle } />
						<PieChartLegend data={ transformedData } />
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
			data: getGoogleMyBusinessStats( state, siteId, ownProps.statType, interval, 'total' ),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
		requestGoogleMyBusinessStats,
	}
)( GoogleMyBusinessStatsChart );
