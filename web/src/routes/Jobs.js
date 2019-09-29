import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Job } from '../components/Job';
import { Snapshots } from '../components/Snapshots';

import { fetchJob, updateJob } from '../services/jobs-service';
import { getJob } from '../reducers/jobs-reducer';
import { showModal, hideModal } from '../actions/modal-actions';

// const Modal = ({ handleClose, show, children }) => {
//     const showHideClassName = show ? 'modal display-block' : 'modal display-none';
//     return (
//         <div className={showHideClassName}>
//             <section className='modal-main'>
//                 {children}
//                 <div className="close" onClick={handleClose}></div>
//             </section>
//         </div>
//     );
// };

class Jobs extends Component {

    componentWillMount() {
        const { fetchJob } = this.props;
        let { pid, fid, jid } = this.props.match.params;
        fetchJob(pid, fid, jid);
    }

    componentWillReceiveProps(nextProps) {
        const { filters: nextFilters } = nextProps;

        if (nextFilters !== this.props.filters) {
            this.handleFetchProducts(nextFilters, undefined);
        }
    }

    render() {
        let { pid, fid, jid } = this.props.match.params;
        let { data, pending } = this.props.job;

        if (pending) return (<div className="loader"></div>);
        if (data.ecode) return (<div><div className="message-head">Ooops! Looks like you got lost...</div><div>The visual test that you are looking for doesn't exists.</div></div>);

        const updateJobAction = ({ source, action }) => {
            const { updateJob } = this.props;
            updateJob({
                pid,
                fid,
                jid,
                source,
                action,
                who: this.props.session.data.username
            });
        };

        let host = `/images/${pid}/${fid}/jobs/${jid}`;
        let base = `/images/${pid}/${fid}/base`;
        let status = data.result.failed > 0 ? 'failed' : (data.result.pending > 0 ? 'pending' : 'passed');

        return (
            <div className="job-content">
                <div className="project-id">{pid}</div>
                <div className="feature-id">{fid}<div className={`marker ${status}-block`}>{status}</div></div>
                <div className="job-info"><a href={data.ref} target="_new">{jid}</a>
                    <span>{data.result.new} new, {data.result.passed} passed, {data.result.failed} failed, and {data.result.pending} pending for action.</span></div>
                <Snapshots screens={data.screens} base={base} host={host} />
                <div className="screens-container">
                    {data.screens
                        .filter(screen => (
                        (screen.diff !== null) && (screen.diff.diff !== 0)))
                        .map(screen => {
                            return (
                                <Job screen={screen} base={base} host={host} 
                                    action={updateJobAction}
                                    key={screen.source} />
                            );
                        })}
                </div>
            </div>
        );
    }
}
/**
                <Modal show={this.props.modal.show} handleClose={this.props.hideModal} >
                </Modal>
 */
const mapStateToProps = state => ({
    job: getJob(state),
    session: state.session,
    modal: state.modal
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchJob,
    updateJob,
    showModal,
    hideModal
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Jobs);