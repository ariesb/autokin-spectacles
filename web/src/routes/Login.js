import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withCookies } from 'react-cookie';

import { fetchProfile } from '../services/session-service';

const Login = ({session, cookies, fetchProfile}) => {
    const token = cookies.get('AutokinSession');
    if (token && !session.data) {
        if (!session.isLoading) fetchProfile(token);
    }

    if(session.isLoading) {
        return (
            <div className="loader"></div>
        );
    }

    return (
        <div className="home-content">
            <div className="signin-head">Gain access and review tests, login now.</div>
            <a href="/auth/gitlab" className="oauth-signin gitlab">
                Sign in with Gitlab
            </a>
        </div>
    );
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchProfile
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(Login));