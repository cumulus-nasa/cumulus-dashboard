import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { get } from 'object-path';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import {
  searchGranules,
  clearGranulesSearch,
  filterGranules,
  clearGranulesFilter,
  listGranules,
  listWorkflows,
  applyWorkflowToGranule,
  applyRecoveryWorkflowToGranule,
  getOptionsCollectionName,
  createReconciliationReport
} from '../../actions';
import { lastUpdated, tally } from '../../utils/format';
import {
  tableColumns,
  defaultWorkflowMeta,
  executeDialog,
  bulkActions,
  recoverAction
} from '../../utils/table-config/granules';
import { historyPushWithQueryParams } from '../../utils/url-helper';
import statusOptions from '../../utils/status';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import List from '../Table/Table';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import Overview from '../Overview/overview';
import ListFilters from '../ListActions/ListFilters';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import DefaultModal from '../Modal/modal';
import TextForm from '../TextAreaForm/text';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Granules',
    active: true
  }
];

class GranulesOverview extends React.Component {
  constructor (props) {
    super(props);
    this.generateQuery = this.generateQuery.bind(this);
    this.generateBulkActions = this.generateBulkActions.bind(this);
    this.queryMeta = this.queryMeta.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.applyWorkflow = this.applyWorkflow.bind(this);
    this.getExecuteOptions = this.getExecuteOptions.bind(this);
    this.setWorkflowMeta = this.setWorkflowMeta.bind(this);
    this.applyRecoveryWorkflow = this.applyRecoveryWorkflow.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.submitListRequest = this.submitListRequest.bind(this);
    this.goToListPage = this.goToListPage.bind(this);
    this.handleReportTypeInputChange = this.handleReportTypeInputChange.bind(this);
    this.defaultListName = () => `granuleList${moment().format('YYYYMMDD')}`;
    this.state = {
      isModalOpen: false,
      isListRequestSubmitted: false,
      listName: this.defaultListName(),
      workflow: this.props.workflowOptions[0],
      workflowMeta: defaultWorkflowMeta
    };
  }

  componentDidMount () {
    this.queryMeta();
  }

  componentDidUpdate (prevProps) {
    if (!isEqual(prevProps.workflowOptions, this.props.workflowOptions)) {
      this.setState({ workflow: this.props.workflowOptions[0] }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  queryMeta () {
    const { dispatch } = this.props;
    dispatch(listWorkflows());
  }

  generateQuery () {
    const { queryParams } = this.props;
    return { ...queryParams };
  }

  generateBulkActions () {
    const actionConfig = {
      execute: {
        options: this.getExecuteOptions(),
        action: this.applyWorkflow
      },
      recover: {
        options: this.getExecuteOptions(),
        action: this.applyRecoveryWorkflow
      }
    };
    const { granules, config } = this.props;
    let actions = bulkActions(granules, actionConfig);
    if (config.enableRecovery) {
      actions = actions.concat(recoverAction(granules, actionConfig));
    }
    return actions;
  }

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  toggleModal() {
    this.setState((prevState) => ({
      ...prevState,
      isModalOpen: !prevState.isModalOpen
    }));
  }

  submitListRequest(e) {
    const { listName } = this.state;
    this.setState({ isListRequestSubmitted: true });
    this.props.dispatch(createReconciliationReport(
      {
        reportName: listName,
        reportType: 'Granule Inventory'
      }
    ));
  }

  goToListPage() {
    historyPushWithQueryParams('/granules/lists');
  }

  closeModal() {
    this.toggleModal();
    this.setState({
      isListRequestSubmitted: false,
      listName: this.defaultListName()
    });
  }

  handleReportTypeInputChange(id, value) {
    this.setState({ listName: value });
  }

  setWorkflowMeta (workflowMeta) {
    this.setState({ workflowMeta });
  }

  applyWorkflow (granuleId) {
    const { workflow, workflowMeta } = this.state;
    const { meta } = JSON.parse(workflowMeta);
    this.setState({ workflowMeta: defaultWorkflowMeta });
    return applyWorkflowToGranule(granuleId, workflow, meta);
  }

  applyRecoveryWorkflow (granuleId) {
    return applyRecoveryWorkflowToGranule(granuleId);
  }

  getExecuteOptions () {
    return [
      executeDialog({
        selectHandler: this.selectWorkflow,
        label: 'workflow',
        value: this.state.workflow,
        options: this.props.workflowOptions,
        initialMeta: this.state.workflowMeta,
        metaHandler: this.setWorkflowMeta,
      })
    ];
  }

  render () {
    const { isModalOpen, isListRequestSubmitted, listName } = this.state;
    const { collections, granules } = this.props;
    const { list } = granules;
    const { dropdowns } = collections;
    const { count, queriedAt } = list.meta;
    return (
      <div className='page__component'>
        <Helmet>
          <title> Granules Overview </title>
        </Helmet>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.granule_overview}</h1>
            {lastUpdated(queriedAt)}
            <Overview type='granules' inflight={false} />
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.granules} <span className='num-title'>{count ? ` ${tally(count)}` : 0}</span></h2>
            <a className='button button--small button--file button--green form-group__element--right'
              id='download_link'
              onClick={this.toggleModal}
            >Create Granule Inventory List</a>
            <DefaultModal
              showModal={isModalOpen}
              onCloseModal={this.closeModal}
              onConfirm={isListRequestSubmitted ? this.goToListPage : this.submitListRequest}
            >
              {!isListRequestSubmitted && (
                <div>
                  <div>You have generated a selection to process for the following list:</div>
                  <TextForm
                    id="reportName"
                    label="List Name"
                    onChange={this.handleReportTypeInputChange}
                    value={listName}
                  />
                  <div>Would you like to continue with generating the list?</div>
                </div>
              )}
              {isListRequestSubmitted && (
                <div>
                  <div>The following request is being processed and will be available shortly</div>
                  <div>{listName}</div>
                  <div>On the Lists page, view the status and download your list when available</div>
                </div>
              )}
            </DefaultModal>
          </div>
          <List
            list={list}
            action={listGranules}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            bulkActions={this.generateBulkActions()}
            rowId='granuleId'
            sortId='timestamp'
            filterAction={filterGranules}
            filterClear={clearGranulesFilter}
          >
            <ListFilters>
              <Search
                action={searchGranules}
                clear={clearGranulesSearch}
                inputProps={{
                  className: 'search search--large',
                }}
                label='Search'
                labelKey="granuleId"
                placeholder='Granule ID'
                searchKey="granules"
              />
              <Dropdown
                options={statusOptions}
                action={filterGranules}
                clear={clearGranulesFilter}
                paramKey='status'
                label='Status'
                inputProps={{
                  placeholder: 'All'
                }}
              />
              <Dropdown
                getOptions={getOptionsCollectionName}
                options={get(dropdowns, ['collectionName', 'options'])}
                action={filterGranules}
                clear={clearGranulesFilter}
                paramKey='collectionId'
                label={strings.collection}
                inputProps={{
                  placeholder: 'All'
                }}
              />
            </ListFilters>
          </List>
        </section>
      </div>
    );
  }
}

GranulesOverview.propTypes = {
  collections: PropTypes.object,
  config: PropTypes.object,
  dispatch: PropTypes.func,
  granules: PropTypes.object,
  queryParams: PropTypes.object,
  workflowOptions: PropTypes.array,
};

export { GranulesOverview };

export default withRouter(withQueryParams()(connect((state) => ({
  collections: state.collections,
  config: state.config,
  granules: state.granules,
  workflowOptions: workflowOptionNames(state),
}))(GranulesOverview)));
