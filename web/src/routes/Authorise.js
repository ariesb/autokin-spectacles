import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withCookies } from 'react-cookie';

import { fetchProfile } from '../services/session-service';

class Authorise extends Component {
    componentWillMount() {
        const { fetchProfile } = this.props;
        let { token } = this.props.match.params;
        if(!this.props.session.isLoading) fetchProfile(token); 
    }

    render() {
        return (
            <div className="auth-content">
                <div className="loader">
                    <div className="gitlab"></div>
                </div>
            </div>
        );
    }
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
)(withCookies(Authorise));