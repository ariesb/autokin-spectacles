import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withCookies } from 'react-cookie';
import {
    NavLink
} from 'react-router-dom';
import { revokeSession, fetchProfile } from '../services/session-service';

const Profile = ({ session, cookies, revokeSession }) => {
    if (!session.data) {
        return (
            <div className="profile-head stranger">Hello Stranger!</div>
        );
    }

    const handleLogoutClick = () => {
        const token = cookies.get('AutokinSession');
        cookies.remove('AutokinSession', { path: '/' });
        setTimeout(() => {
            revokeSession(token)
        }, 100);
    }

    return (
        <div className="profile-head">
            <div className="head-menu">
                <NavLink className="dashboard" to="/">
                    <svg aria-hidden="true" focusable="false" data-prefix="fad" data-icon="tasks-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="icon-dashboard"><g className="dashboard-group"><path fill="currentColor" d="M488.12 352H23.94A23.94 23.94 0 0 0 0 375.88V456a23.94 23.94 0 0 0 23.88 24h464.18A23.94 23.94 0 0 0 512 456.12V376a23.94 23.94 0 0 0-23.88-24zM464 432H48v-32h416zm24.12-240H23.94A23.94 23.94 0 0 0 0 215.88V296a23.94 23.94 0 0 0 23.88 24h464.18A23.94 23.94 0 0 0 512 296.12V216a23.94 23.94 0 0 0-23.88-24zM464 272H48v-32h416zm24.12-240H23.94A23.94 23.94 0 0 0 0 55.88V136a23.94 23.94 0 0 0 23.88 24h464.18A23.94 23.94 0 0 0 512 136.12V56a23.94 23.94 0 0 0-23.88-24zM464 112H48V80h416z" className="dashboard-secondary"></path><path fill="currentColor" d="M48 80v32h304V80zm112 160H48v32h112zM48 432h240v-32H48z" className="dashboard-primary"></path></g></svg>
                    <label>dashboard</label>
                </NavLink>
            </div>
            <div className="details">
                <div className="display-name">{session.data.displayName}</div>
                <div className="options">{session.data.username} | <span onClick={handleLogoutClick}>Logout</span></div>
            </div>
            <img className="avatar" src={session.data.avatarUrl} alt={session.data.displayName}/>
        </div>
    );
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchProfile,
    revokeSession
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(Profile));