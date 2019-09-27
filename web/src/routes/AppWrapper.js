import React from 'react';
import '../App.css';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';


import Home from './Home';
import Login from './Login';
import Jobs from './Jobs';
import Authorise from './Authorise';
import ControlCenter from '../components/ControlCenter';
import Footer from '../components/Footer';

const userIsAuthenticated = connectedRouterRedirect({
    redirectPath: '/login',
    authenticatedSelector: state => state.session.data !== null,
    wrapperDisplayName: 'UserIsAuthenticated'
});

const locationHelper = locationHelperBuilder({});
const userIsNotAuthenticated = connectedRouterRedirect({
    redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
    allowRedirectBack: false,
    authenticatedSelector: state => state.session.data === null,
    wrapperDisplayName: 'UserIsNotAuthenticated'
});

const  AppWrapper = () => {
    return (
        <Router>
            <div className="App">
                <ControlCenter/>
                <section className="content">
                    <Route path="/" exact={true} component={userIsAuthenticated(Home)} />
                    <Route path="/:pid/:fid/jobs/:jid" component={userIsAuthenticated(Jobs)} />
                    <Route path="/login" key="gitlab-login" component={withRouter(userIsNotAuthenticated(Login))} />
                    <Route path="/authorise/:token" component={withRouter(userIsNotAuthenticated(Authorise))} />
                </section>
                <Footer />
            </div>
        </Router>
    );
}

const mapStateToProps = state => ({
    session: state.session
})

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppWrapper);

