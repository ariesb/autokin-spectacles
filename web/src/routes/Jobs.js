import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Job } from '../components/Job';
import { Snapshots } from '../components/Snapshots';

import { fetchJob, updateJob } from '../services/jobs-service';
import { getJob } from '../reducers/jobs-reducer';

class Jobs extends Component {

    componentWillMount() {
        const { fetchJob } = this.props;
        let { pid, jid } = this.props.match.params;
        fetchJob(pid, jid);
    }

    componentWillReceiveProps(nextProps) {
        const { filters: nextFilters } = nextProps;

        if (nextFilters !== this.props.filters) {
            this.handleFetchProducts(nextFilters, undefined);
        }
    }

    render() {
        let { pid, jid } = this.props.match.params;
        let { result, pending } = this.props.job;

        if (pending) return (<div>Loading</div>);
        if(result.ecode) return (<div>No job.</div>);

        const updateJobAction = ({ source, action }) => {
            const { updateJob } = this.props;
            updateJob({
                pid,
                jid,
                source,
                action,
                who: this.props.session.data.username
            });
        }

        let host = `/images/${pid}/jobs/${jid}`;
        let base = `/images/${pid}/base`;

        return (
            <div className="job-content">
                <div className="project-id">{pid}</div>
                <div className="job-info"><span>{jid}</span>|<span><a href={result.ref} target="_new">Build Link</a></span>|<span>
                    {new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'long',
                        timeStyle: 'medium'
                    }).format(new Date(result.when))}</span></div>
                <Snapshots screens={result.screens} base={base} host={host} />
                {result.screens
                    .filter(screen => (
                       (screen.diff !== null) && (screen.diff.diff !== 0)))
                    .sort((a, b) => a.acted ? 1 : -1)
                    .map(screen => {
                        return (
                            <Job screen={screen} base={base} host={host} action={updateJobAction} key={screen.source}/>                            
                        );
                    })}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    job: getJob(state),
    session: state.session
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchJob,
    updateJob
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Jobs);