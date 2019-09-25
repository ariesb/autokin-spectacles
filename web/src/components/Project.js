import React from 'react';
import { NavLink } from 'react-router-dom';
import Moment from 'react-moment';

export const Project = ({project}) => {
    const { pid, fid, jobs } = project;
    let [ job ] = jobs;
    let status = job.result.failed > 0 ? 'failed' : (job.result.pending > 0 ? 'pending' : 'passed');
    return (
        <NavLink className={`project-block ${status}-block`} to={`/${pid}/${fid}/jobs/${job.jid}`}>
            <div className="project-header">
                <div className="project-name">{pid}</div>
                <div className="job-name">{fid}</div>
            </div>
            <div className="last-status">{job.result.new} new, {job.result.passed} passed, {job.result.failed} failed, and {job.result.pending} pending for action.</div>
            <div className="last-run">
                <img className="avatar" src={job.user.avatarUrl || ''} alt="" />
                <div className="display-name">{job.user.displayName || job.author}</div>
                <Moment className="display-time" fromNow>{job.when}</Moment>
            </div>
        </NavLink>
    );
}
