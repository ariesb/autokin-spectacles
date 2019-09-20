import React from 'react';
import { NavLink } from 'react-router-dom';
import Moment from 'react-moment';

export const Project = ({project}) => {
    const { pid, jobs } = project;
    let [ job ] = jobs;
    let status = job.result.failed > 0 ? 'p-failed' : (job.result.pending > 0 ? 'p-pending' : 'p-passed');
    return (
        <NavLink to={`/${pid}/jobs/${job.jid}`}>
            <div className={`project-overview ${status}`}>
                <div className="name">{pid}</div>
                <div className="last-job">
                    <div className="last-status">{job.result.new} new, {job.result.passed} passed, {job.result.failed} failed, and {job.result.pending} pending for action.</div>
                    <div className="last-run">Last test run by {job.author} was <Moment fromNow>{job.when}</Moment>.</div>
                </div>
            </div>
        </NavLink>
    );
}
