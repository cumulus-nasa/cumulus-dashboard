import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { listExecutionsByGranule } from '../../actions';
import List from '../Table/Table';
import { tableColumns } from '../../utils/table-config/executions';

const breadcrumbConfig = [
    {
        label: 'Dashboard Home',
        href: '/',
    },
    {
        label: 'Executions',
        href: '/executions'
    },
    {
        label: 'Executions List',
        active: true
    }
];

const ExecutionsList = ({
    match,
    executions
}) => {
    const { list } = executions || {};
    const { params } = match || {};
    const { collectionId, granuleId } = params;

    const payload = {
        granules: [
            {
                granuleId: decodeURIComponent(granuleId),
                collectionId: decodeURIComponent(collectionId)
            }
        ],
    }

    return (
        <div className='page__component'>
            <Helmet>
                <title> Executions for {granuleId} </title>
            </Helmet>

            <section className='page__section page__section__header-wrapper'>
                <section className="page__section page__section__controls">
                    <Breadcrumbs config={breadcrumbConfig} />
                </section>
                <h1 className='heading--large heading--shared-content with-description with-bottom-border width--three-quarters'>
                    Executions for {granuleId}
                </h1>
                <section className="page__section">
                    <div className="heading__wrapper--border">
                        <h2 className="heading--medium heading--shared-content with-description">Total Executions
                            <span className='num-title'>{list.meta.count || 0}</span>
                        </h2>
                    </div>
                    <List
                    list={list}
                    tableColumns={tableColumns}
                    action={(() => listExecutionsByGranule(payload))}
                    >

                    </List>
                </section>
            </section>
        </div>
    );
};

ExecutionsList.propTypes = {
    executions: PropTypes.object
};

export { ExecutionsList };

export default withRouter(
    connect((state) => ({
        executions: state.executions
    }))(ExecutionsList)
);
