import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withCookies } from 'react-cookie';
import { Project } from '../components/Project';

import { fetchProjects } from '../services/projects-service';

const Home = (props) => {
    
    const { fetchProjects } = props;

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]); 

    if (props.projects.length < 1) {
        return (
            <div className="no-projects">Nothing here, upload new project to start.</div>
        );
    }

    return (
        <div className="home-content">
            {props.projects.map(project => {
                return (
                    <Project project={project} key={project.pid}/>
                );
            })}
        </div>
    );
}

const mapStateToProps = state => ({
    session: state.session,
    projects: state.projects.projects
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchProjects
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(Home));