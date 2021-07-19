# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]


## Breaking Changes

- **CUMULUS-2502**
  - Configuration changes are required to continue connecting the dashboard with Earthdata Metrics
  - Metrics integration has been updated to require manual configuration rather
    than by an assumed naming convention.  As such, new environmental variables
    describing the Elasticsearch target patterns have been added (check with
    your metrics provider for the exact values):
     + ES\_CLOUDWATCH\_TARGET\_PATTERN (Generally: `<daac>-cumulus-cloudwatch-<env>-*`)
     + ES\_DISTRIBUTION\_TARGET\_PATTERN (Generally: `<daac>-distribution-<env>-*`)
  - Kibana links are changed. We no longer try to build URLs that describe the
    metrics' Elasicsearch results. Instead, we now only return a simple link to
    configured Kibana root.  It is up to the kibana user to interact with the
    dashbaord, setting default security tenant and default kibana index
    patterns. You can create kibana Index Patterns (or they may exist already)
    to gather the cloudwatch logs sent to metrics with a similar patter to the
    ES\_CLOUDWATCH\_TARGET\_PATTERN, and if you have configured s3 server access
    logs, likewise use a pattern like the ES\_DISTRIBUTION\_TARGET\_PATTERN.

### Changed

- **CUMULUS-2502**
  - Metrics ES searches have been updated to run against only the index
    patterns provided, improving performance and saving resources.
  - Documentation for metrics has been moved into its own table.
  - Upgrade cypress testing framework to 7.3.0
- **CUMULUS-2505**
  - Update column show/hide component with new styling and "reset to default interaction for each table
- **CUMULUS-2506**
  - Adds horizontal scroll buttons to tables improving accessibily
- **CUMULUS-2524**
  - CSS and UI tweaks to padding/margin, width, and color/contrast
- **CUMULUS-2534**
  - Added a copy button to errors pages so the error can be copied and searched up on the internet. 
- **CUMULUS-2535**
  - Ensured that the KPI cards would be updated on all tabs whenever the page was updated
- **CUMULUS-2540**
  - Add Granule Actions group & Functionality to other pages/sections with granules to manage
- **CUMULUS-2544**
  - Changed the timestamp so that the date and time is shown rather than time elapsed since last occurrence
- **CUMULUS-2551**
  - Added a sortable column to individual granules tab so you can sort each file within the granule by size. 
- **CUMULUS-2554**
  - Add focus styles for various browser support and keyboard/mouse inputs 
- **CUMULUS-2573**
  - Changed the dropdown menu in the individual providers page into a delete button.

### Fixed

- **CUMULUS-2525**
  - Fixes granule execute modal rerender issue when workflow options are not changed
- **CUMULUS-2553**
  - Fixed DatePicker prop so the leading zeroes can be entered without having too many zeroes clouding the input.

## [v6.0.0] - 2021-05-03

## Breaking Changes

This version of the dashboard requires Cumulus API `v8.1.0`

## All Changes

### Fixed

- **CUMULUS-2449**
  - Fixes issue where collections with forward slash in version name were not displayed

_ **CUMULUS-2425**
  - Fixes graph display for failed execution steps

### Added

- **CUMULUS-2348**
  - Implement Granule Recovery status
  - Requires @cumulus/api@7.2.1-alpha.0

- **CUMULUS-2435**
  - Add step name to execution events

### Changed

- **CUMULUS-2282**
  - Adds component that displays errors returned from a configured metrics
    endpoint.  Specifically, letting a user know that they are unauthorized
    when trying to retrieve data from ESROOT rather than just not showing the
    data.
  - Changes requestMiddleware and handleError.  Existing behavior is retained,
    but when an error has no message in its response, we look to the error
    message which has useful information to show the user.
  - Upgrades Cypress testing software to 7.0.1
  - Refactors home page and adds a new section header

- **CUMULUS-2467**
  - Update to footer layout to include NASA privacy links to help move Cumulus into compliance with other EED products

## [v5.0.0] - 2021-03-23

## Breaking Changes

This version of the dashboard requires Cumulus API 7.0.0

### Fixed

- **CUMULUS-bugfix**
  - Fixes typos in version compatibility tests

- **CUMULUS-2310**
  - Allow slash in reconciliation report name

- **CUMULUS-2349**
  - Stop scrolling of checkboxes in tables
  - Other tweaks to prevent unexpected horizontal scrolling in tables

- **CUMULUS-2415**
  - Fixes issue with executions not always displaying the graph corresponding to the current execution

- **CUMULUS-2419**
  - Fixes log viewer query for cloud metrics log
  - Requires @cumulus/api@7.0.0

### Changed

- **CUMULUS-bugfix**
  - replaced deprecated node-sass with sass

- **CUMULUS-2321**
  - Updated reconciliation report to work with the API endpoint changes
  - Requires @cumulus/api@5.0.2-alpha.0

- **CUMULUS-2366**
  - Removes logs from dashboard display when metrics is not setup

- **CUMULUS-2430**
  - Overview KPI status cards: Change styling to new design

- **CUMULUS-2056**
  - Added Events link to Details section of Executions page
  - On Events tab of Execution page, highlighted in the red the failed tasks
  - On Events tab of Execution page, made tasks expandable to show event details

### Added

- **CUMULUS-2297**
  - Add ability to show/hide columns on all tables

- **CUMULUS-2430**
  - Overview KPI status cards: Add tooltip to display full totals

## [v4.0.0] - 2021-01-13

## Breaking Changes

This version of the dashboard requires Cumulus API v5.0.0

## All Changes

### Fixed
- **CUMULUS-1765**
  - Update 'Errors' tile Kibana link to reflect 'failed' granules and datepicker
  - Update 'Logs' Kibana link to reflect datepicker

- **CUMULUS-2069**
  - Standardize UI button groups

- **CUMULUS-2072**
  - Add 'Show More' and 'Show Less' buttons to error report

- **CUMULUS-2073**
  - Update forms with the required indicator and description

- **CUMULUS-2148**
  - Fix bug on Report deletion where the report wouldn't be removed from the table

- **CUMULUS-2263**
  - Update Pagination input to show possible page options in dropdown

- **CUMULUS-2292**
  - Increase the size of search boxes and dropdown lists

- **CUMULUS-2322**
  - Fix pagination issue causing rerender
  - Remove `node-notifier` to remediate security vulnerability

### Added
- **CUMULUS-1763**
  - Add tests for different dashboard configurations

- **CUMULUS-1885**
  - Expand columns to fit full content width when separator is double clicked

- **CUMULUS-1895**
  - Update execution events to display more details in modal

- **CUMULUS-1949**
  - Update modals with progress circle and alerts

- **CUMULUS-2066**
  - Add [eslint-plugin-jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y)
  - Add [@ace-core/react](https://www.npmjs.com/package/@axe-core/react)

- **CUMULUS-2169**
  - Add provider drop down to granule tables to filter by provider

- **CUMULUS-2206**
  - Implement lazy loading for SortableTable, Datepicker, and Sidebar
  - Improve performance

- **CUMULUS-2259**
  - Production build now minimizes code.
  - CI now uses Docker images from maven.earthdata.nasa.gov/ via optional environmental variable DOCKER_REPOSITORY that is placed in front of the desired images.

- **CUMULUS-2270**
  - Add provider drop down filter to Collections Overview page

- **CUMULUS-2272**
  - Add popover to granuleId and collection name table columns to view and copy full cell text

- **CUMULUS-2291**
  - Add provider filter to Granule Inventory Report

### Changed

- **CUMULUS-2070**
  - Styling changes included a small css refactor.

- **CUMULUS-2071**
  - Replace the static "Granule Updates" stats on the home page with clickable cards
  - Animate the Reconciliation Report > "Bucket Status" cards


- **CUMULUS-2074**
  - Update status on execution details page to be displayed as a badge
  - Other styling tweaks on execution details page

- **CUMULUS-2176**
  - Update styles for Granule Not Found Reports
  - Add tooltips to indicators on GNF reports

- **CUMULUS-2242**
  - Changes underlying Docker files for building dashboard bundle and dashboard image via docker.  The user interface remains the same.

- **CUMULUS-2251**
  - Add the `Granule Actions` button

- **CUMULUS-2262**
  - Revised `Delete Granule` workflow to allow removing from CMR and then deleting in one step

- **CUMULUS-2269**
  - Replace `request`/`request-promise` packages with `axios`

- **CUMULUS-2271**
  - Allow horizontal scrolling in table cells when content doesn't fit in view

- **CUMULUS-2280**
  - Continuous integration moved to earthdata bamboo.
  - CircleCI configuration removed from project.

- **CUMULUS-2325**
  - Updates Cypress test software to 6.2.1.

## [v3.0.0]

### Fixed
- **CUMULUS-2226**
  - Loading and sorting the Failed Granules table no longer causes the screen to jump to the top of the table.

- **CUMULUS-2242** and **CUMULUS-2177**
  - building with `npm run build` will now build a distribution that can be served from behind cloudfront.
  - Fixed bug in nginx config that allows the application to run in the continer built by `bin/build_dashboard_image.sh`.
  - Overhauled the README.md and added a "Quick start" section

- **CUMULUS-1873**
  - Clear selected items in table when filter is applied

- **CUMULUS-2249**
  - clear infix search parameter when Search component is unmounted

- **CUMULUS-2238**
  - Fix "Date and Time Range" CSS on Chrome and Firefox. Dropdowns now display icons correctly and elements don't shift when selected.

- **CUMULUS-2147**
  - clear execution errors from granules list when async commands are completed

- **CUMULUS-2135**
  - Pagination table header UI CSS tweaks

### Added

- **CUMULUS-2091**
  - Add Tooltip component
  - Add blue tooltip for timestamp values in the table

- **CUMULUS-2200**
  - Add Granule List page. Use Granule Inventory reports for generating granule CSVs

- **CUMULUS-2225**
  - Rename "Type" column "Error Type" on Failed Granules and Home pages and allow sorting
  - Add Error Type filter to Failed Granules page

- **CUMULUS-2218**
  - Add `Bulk Reingest` to Bulk Granules actions

### Changed

- **CUMULUS-2063**
  - Updates the dashboard to use alpha version `@cumulus/api@3.0.1-alpha.2` for testing.
  - Code changes to allow for private CMR collections to have links to the MMT.
- **CUMULUS-2215**
  - Omits unnecesary statistics request when building the option list of collection names on the granules page.
- **CUMULUS-2171**
  - Allows filtering of the Granule Inventory List CSV download based on Granule IDs, Status, and Collection.
- **CUMULUS-2242**
  - Moves cypress testing to run against production build in CI.
  - renames helper scripts to better describe their purposes
    - `./bin/build_in_docker.sh` -> `./bin/build_dashboard_via_docker.sh`
    - `./bin/build_docker_image.sh` -> `./bin/build_dashboard_image.sh`

### Removed
 -**CUMULUS-2242**
   - Removes unnecessary validation tests.
   - Removes README.md documentation for NGAP Sandbox Metrics Development

## [v2.0.0]

### BREAKING CHANGES

- This dashboard version requires Cumulus API version >= v3.0.0

### Added

- **CUMULUS-417**
  - Add some ESLint configuration to improve code quality
  - Upgrades Cypress to 4.12.0

- **CUMULUS-1884**
  - Add collapse/expand sidebar functionality

- **CUMULUS-1892**
  - Added TableHeader component to allow user to select page and limit params
  - Removed all Results Per Page dropdowns in favor of the header

- **CUMULUS-1966**
  - Add form fields for new params to create report form
  - Upgrades Cypress to 5.2.0

- **CUMULUS-2046**
  - Add dashboard version to footer

- **CUMULUS-2076**
  - Add context references in headings on indivdual pages for screen reader accessibility

- **CUMULUS-2087**
  - Add Reconciliation Report creation page with report type selection

- **CUMULUS-2089**
  - Add component for Granule Not Found reports

- **CUMULUS-2108**
  - Additions to support passing custom `meta` into a workflow via the dashboard as required by CUMULUS-2107:
    - Added a `meta` field to the bulk granule default input. This field will be merged into the workflow input's `meta` context.
    - Added a collapsible textArea containing a `meta` field (linked as `Add Custom Workflow Meta`) to the `Execute` modal on granules overview, list and details views.

- **CUMULUS-2114**
  - Add download button to the Internal report link

### Changed

- **CUMULUS-2021**
  - Update search to use react-bootstrap-typeahead to get autocomplete functionality
  - Adds clear button when search option is selected
  - Highlights text on input focus

- **CUMULUS-2023**
  - Update filter drop downs to have the same order as columns

- **CUMULUS-2068**
  - Converts select dropdowns to react-select component

- **CUMULUS-2086**
  - Update the styling on the Granule Not Found report page

- **CUMULUS-2090**
  - Moved report headings that include breadcrumbs, name, dates, status, and download button into a reusable ReportHeading component to be used for all report types.

- **CUMULUS-2022**
  - Improve search character limit

### Fixed

- Fixed broken Kibana links in bulk granule operation modals

- **CUMULUS-1876**
  - Fix/remove unnecessary timers on home page

- **CUMULUS-2067**
  - Tweak footer styles

- **CUMULUS-2121**
  - Fix PDR list page with status filter
  - Update individual PDR page to properly display granules

- **CUMULUS-2136**
  - Fix Form component to report invalid json error

- **CUMULUS-2140**
  - Update npm packages to fix security vulnerabilities

## [v1.10.0]

### BREAKING CHANGES

- This dashboard version requires Cumulus API version >= v2.0.1

### Added

- **CUMULUS-1805**
  - Shows running, completed, and failed granule format for when there are zero granules,
    before it would just say "Granules 0," but now will show zeros in all categories.
- **CUMULUS-1886**
  - Support sorting on multiple columns
- **CUMULUS-1904**
  - Adds a TableFilters component for dynamically showing/hiding table columns

- **CUMULUS-1906**
  - Adds a download button dropdown to reconciliation report inventory view.
    Option to download full report as json or indivdual tables as csv files.

- **CUMULUS-1908**
  - Adds Conflict Type and Conflict Details columns to reconciliation report inventory view tables.

- **CUMULUS-1914**
  - Adds a legend component for reconciliation reports

- **CUMULUS-1917**
  - Adds a download button to reconciliation report list page

- **CUMULUS-1918**
  - Adds delete report button to the Reconciliation Reports page

- **CUMULUS-1977**
  - Added BulkGranuleModal component for creating modals to submit bulk granule requests

- **CUMULUS-2018**
  - Add search option to individual Reconciliation Report page
  - Add ability to filter by S3 bucket on Reconciliation Report page

- **CUMULUS-**
  - upgrades node to 12.18.0
  - Upgrade Cypress to latest version (4.8.0)

### Changed

- **CUMULUS-1773**
  - Updated query param functionality so that when URLs are shared, the lists will be filtered based on those params
  - Persists startDateTime and endDateTime params on all links and redirects within the app

- **CUMULUS-1815**
  - Refactor some PDR components. No user facing changes.

- **CUMULUS-1830**
  - Fix redirect issue when logging out from the page with URL path containing dot

- **CUMULUS-1836**
  - Replace react-autocomplete with react-bootstrap-typeahead
  - Allow custom values in Results per Page dropdowns

- **CUMULUS-1861**
  - Update Execution/Rule tables to handle undefined collectionIds
  - Update Rule add dialogue logic to allow Rule creation without a collection
    value.

- **CUMULUS-1905**
  - Updates Inventory Report view to clarify Cumulus's internal consistency differences and Cumulus's differences with CMR.

- **CUMULUS-1919**
  - Update styles for report view

- **CUMULUS-1919**
  - Updates styles on Reconciliation Report list page

- **CUMULUS-1977**
  - Updated BulkGranule component to display a modal that allows you to choose
  the type of bulk request you want to submit: bulk granule operations or bulk
  granule delete.

- **CUMULUS-1994**
  - No default datetime filters are applied when the application is loaded.
  - Upgrade Cypress to latest version (4.7.0)

- **CUMULUS-2019**
  - Support partial search

- **CUMULUS-2029**
  - Overview tiles are updated to represent what is shown in the table

### Fixed

- **CUMULUS-1815**
  - Fix timer bug in PDR Tables. This was causing an issue where a table that
    was supposed to be showing a subset of PDRs was showing all PDRS

- **CUMULUS-1831**
  - Fix batch async modals so they close on success/error

- **CUMULUS-1842**
  - Fix dashboard table sort issue

- **CUMULUS-1870**
  - Fix/remove unecessary timers on Pdrs page

- **CUMULUS-1871**
  - Fix/remove unecessary timers on Providers page

- **CUMULUS-1872**
  - Fix/remove unecessary timers on granules page

- **CUMULUS-1873**
  - Fix/remove unecessary timers on executions page

- **CUMULUS-1875**
  - Fix/remove unecessary timers on Operations Page

- **CUMULUS-1877**
  - Fix/remove unecessary timers on Reconcilation Reports page

- **CUMULUS-1882**
  - Fix ES query for TEA Lambda metrics
  - Update Kibana links on homepage for TEA metrics

- **CUMULUS-2024**
  - Fix bug where new providers and collections were not being pulled in as options on the Add Rule page

- **CUMULUS-2040**
  - Fix reconciliation report pagination so that it does not display all pages when there are a large number of conflicts

## [v1.9.0]

### BREAKING CHANGES

- This dashboard version requires Cumulus API version >= v1.23.0

### Changed

- **CUMULUS-1888**
  - On the Granules page, CSV data was being refreshed in the background alog with the rest
    of the data based on the timer. This could take a long time, depending on the number of granules.
    This has been changed so that the data is only fetched when the user clicks the "Download CSV" button.

- **CUMULUS-1913**
  - Add datepicker to reconcilation-reports page

- **CUMULUS-1915**
  - Add filters for `Report Type` and `Status` to reconcilation-reports page

- **CUMULUS-1916**
  - reconcilation-reports page now requires Cumulus API version >= v1.23.0

## [v1.8.1]

### Changed

- **CUMULUS-1816**
  - Change Datepicker behavior on login. The default to "Recent" start/end dates
    now only occurs on first login on the hompage.
  - URL is updated on login to reflect Datepicker params

- **CUMULUS-1903**
  - Replace individual tables in reconciliation report with tabs that change which table is displayed on click

- **CUMULUS-1920**
  - Add additional columns to reconciliation report list

- **CUMULUS-1920**
  - Updated styles for granule reingest modal

- **CUMULUS-1948**
  - Add provider to Granules tables

### Fixed

- **CUMULUS-1881**
  - Fix Elasticsearch query bug for Gateway Access Metrics

- **CUMULUS-1984**
  - Fix bug where Distribution metrics were showing on the homepage even when
    Elasaticsearch/Kibana not set up

- **CUMULUS-1988**
  - Fix bugs in reducer-creators


## [v1.8.0]

### Added

- **CUMULUS-1515**
  - filter capability to workflow overview page.

- **CUMULUS-1526**
  - Add a copy rule button

- **CUMULUS-1538**
  - Add ability to expand size of visual on execution details page

- **CUMULUS-1646**
  - Add 'Results Per Page' dropdown for tables that use pagination

- **CUMULUS-1677**
  - Updates the user experience when re-ingesting granules. Adds Modal flow for better understanding.

- **CUMULUS-1798**
  - Add a refresh button
  - Add individual cancel buttons for date time range inputs

- **CUMULUS-1822**
  - Added dynamic form validation as user types

### Changed

- **CUMULUS-1460**
  - Update dashboard headers overall
  - Move remaining "add" buttons to body content

- **CUMULUS-1467**
  - Change the metrics section on the home page to update based on datepicker time period.

- **CUMULUS-1509**
  - Update styles on grnaules page

- **CUMULUS-1525**
  - Style changes for rules overview page

- **CUMULUS-1527**
  - Style changes for individual rule page

- **CUMULUS-1528**
  - Change add/copy rule form from raw JSON input to individual form fields.
    Workflow, Provider, and Collection inputs are now dropdowns populated with
    currently available items.

- **CUMULUS-1537**
  - Update execution details page format
  - Move execution input and output json to modal

- **CUMULUS-1538**
  - Update executions details page styles

- **CUMULUS-1787**
  - Changes `listCollections` action to hit `/collections/active` endpoint when timefilters are present (requires Cumulus API v1.22.1)

- **CUMULUS-1790**
  - Changes default values and visuals for home page's datepicker. When the page loads, it defauls to display "Recent" data, which is the previous 24 hours with no end time.

- **CUMULUS-1798**
  - Change the 12HR/24HR Format selector from radio to dropdown
  - Hide clock component in react-datetime-picker

- **CUMULUS-1810**
  - Unified the coding pattern used for creating Redux reducers to avoid
    unnecessary object creation and reduce unnecessary UI component refreshes

### Fixed

- **CUMULUS-1813**
  - Fixed CSS for graph on Execution status page
  - Removed Datepicker from Execution status page

- **CUMULUS-1822**
  - Fixed no user feedback/errors when submitting a blank form

## [v1.7.2] - 2020-03-16

### Added

- **CUMULUS-1535**
  - Adds a confirmation modal when editing a rule

- **CUMULUS-1758**
  - Adds the ability to resize table columns

### Changed

- **CUMULUS-1693**
  - Updates the bulk delete collection flow

- **CUMULUS-1758**
  - Updates table implementation to use [react-table](https://github.com/tannerlinsley/react-table)

## [v1.7.1] - 2020-03-06

Fix for serving the dashboard through the Cumulus API.

## [v1.7.0] - 2020-03-02

### BREAKING CHANGES

- This dashboard version requires Cumulus API version >= v1.19.0

### Added

- **CUMULUS-1102**
  - Adds ability to run dashboard against Cumulus localAPI.
    - Adds a number of docker-compose commands to be run via `npm run <command>`
        - `seed-database` - loads data fixtures into a running stack for testing
        - `start-localstack` - starts necessary backend for cumulus API. LocalStack + Elasticsearch
        - `stop-localstack` - stops same
        - `start-cumulusapi` - starts localstack and cumulus localAPI
        - `stop-cumulusapi` - stops same
        - `start-dashboard` - starts localstack, cumulus localAPI and dashboard
        - `stop-dashboard` - stops same
        - `e2e-tests` - starts starts localstack, cumulus localAPI, dashboard and cypress end to end tests.
        - `validation-tests` - starts starts localstack, cumulus localAPI, dashboard and validation tests.
        - `view-docker-logs`- helper to view logs for the currently running docker-compose stack.

- **CUMULUS-1463**
  - Add Datepicker to Dashboard Home page

- **CUMULUS-1502**
  - Add copy collection button

- **CUMULUS-1534**
  - Add confirmation modal when adding a new rule

- **CUMULUS-1581**
  - Added support Bulk Granule Operations

- **CUMULUS-1582**
  - Added Operations page to track Async Operations

- **CUMULUS-1729**
  - Connects Datepicker to the redux store.

### Changed

- ** CUMULUS-1102
  - Integration (cypress) tests and validation tests run in container against local Cumulus API.
  - Upgrades to node 10.16.3

- **CUMULUS-1690**
  - Update Task Manager from Gulp/Browserify to Webpack
    - Removed Gulp configurations
      - All dependencies with Gulp/Browserify are removed
    - Added Webpack v4 configurations
      - New/replacement dependencies are added for Webpack
    - Upgraded to ReactJS 16.10.2 to work with Webpack v4 - Due to the React change the following dependencies are affected:
      - Upgraded React-Router to v5.1.2
      - Added Connected React Router 6.6.1
      - Upgraded History to v4.7.2
    - Updated Node from v8 to v10

### Fixed

- **CUMULUS-1459**
  - Updates Operations page to receive async operations list from Elasticsearch.

- **CUMULUS-1363**
  - Use `npm` instead of `yarn`
  - Update packages to fix security vulnerabilities

- **CUMULUS-1670**
  - Fixed bug preventing update of providers

- **CUMULUS-1679**
  - The UI no longer breaks by producing a blank page when the user types in the
    log search box on the granule details page.

### Deleted

- **CUMULUS-1102**
  - Removes fake-api.js.  The fake-api is removed in favor of running a Cumulus API locally.

- **CUMULUS-1690**
  - Removed Gulp/Browserify and their dependencies.

### Fixed

- **CUMULUS-1670**
  - Fixed bug preventing update of providers

## [v1.6.1] - 2019-11-12

### Fixed

- **CUMULUS-1308**
  - Fixed bug preventing rerun, enabling, and disabling of rules

## [v1.6.0] - 2019-10-10

### BREAKING CHANGES

- You must be using Cumulus API version >= v1.14.2 in order to use Launchpad
  authentication. There is also an error display fix that requires 1.14.2+.

### Added

- **CUMULUS-639**
  - Adds optional Launchpad authorization integration via AUTH_METHOD
    environment variable.

- **CUMULUS-1308**
  - Pass full provider object to API on edit to ensure compatibility with API
    changes where HTTP PUTs for Collections, Providers, and Rules expect full
    objects to be supplied (rather than partial objects)
  - Upgrade Cypress to latest version (3.4.1)
  - Eliminate "caniuse-lite is outdated" message during testing
  - Fix flaky Cypress integration test
  - Fix invalid value for prop `className` on `<a>` tag
  - Fix failed prop type error for checkboxes in tables
  - Fix unhandled rejection in `getMMTLinks` function

### Fixed

- **CUMULUS-1427**
  - Dashboard home page no longer displays non-error granules in the Granules
    Errors list

- **CUMULUS-1456**
  - Error messages are displayed correctly from the API. Note: you must be on
    API version 1.14.2 or later.

## [v1.5.0] - 2019-08-26

### BREAKING CHANGES

- You must be using Cumulus API version >= v1.14.0 in order to use the new
  distribution metrics functionality.

### Added

- **CUMULUS-1337**
  - Must use Cumulus API version v1.14.0 or above in order to use the newi
    distribution metrics functionality.
  - Distribution metrics are no longer served from the Cumulus API, but are
    computed from the logs in an ELK stack.
  - If you want to display distribution metrics using a Kibana instance (ELK
    stack), you need to set the environment variables `KIBANAROOT` to point to
    the base url of an accessible Kibana instance as well as `ESROOT` to the
    Elastic Search endpoint holding your metrics.
  - The `KIBANAROOT` will be used to generate links to the kibana discovery page
    to interrogate errors/successes further.
  - The `ESROOT` is used to query Elasticsearch directly to retrieve the
    displayed counts.
  - For information on setting up the Cumulus Distribution API Logs and S3
    Server Access see the [Cumulus Distribution Metrics documentation].
  - See this project's `README.md` for instructions on setting up development
    access for Kibana and Elasticsearch.

## [v1.4.0] - 2019-04-19

### BREAKING CHANGES

- You must be using Cumulus API version 1.12.1 or above with this version of the
  dashboard.

### Added

- **CUMULUS-820**
  - Added information from Cumulus vs CMR reconciliation report to page (files,
    collections, granules)
  - Added ability to expand/collapse tables in reconciliation report output.
    Tables larger than 10 rows are collapsed by default.

### Changed

- Updated to `gulp-sass@^3` so Python build of `node-sass` library is not
  required. Removed unnecessary direct dependency on `node-sass` package.

### Fixed

- Updates to `./bin/build_in_docker.sh` (Fixes #562):
  - Use `yarn` instead of `npm`.
  - Updated script to run in `node:8-slim` Docker image instead of `node:slim`.
  - Added ability to specify all environment variables for configuring dashboard
    when building via `./bin/build_in_docker.sh`.
  - Removed install of unnecessary system packages.

### Removed

- **CUMULUS-997** - Removed the deprecated "associated collections" section from
  the individual provider pages

## [v1.3.0] - 2019-03-04

### Added

- Execution details (inputs and outputs) are shown for executions and execution
  steps. [CUMULUS-692]
- Link to parent workflow execution if any exists. [Cumulus-689]
- Logs for specific workflow executions. [Cumulus-691]
- Documentation was added to the `execution-status.js` component about how to
  find task / version information for step function events. [Cumulus-690]
- Added Cypress for front-end testing. [Cumulus-918]
- Added tests for the login page and dashboard home page. [Cumulus-638]
- Added tests for the Collections page and Providers page. [Cumulus-643]
- Added warning message to granules `reingest` button to indicates that existing
  data will be overwritten. [Cumulus-792]

### Changed

- Updated React to version 16.6.3
- Updated all component classes using ES6 style [Cumulus-1096]

## [v1.2.0] - 2018-08-08

### Added

- `Execute` option on granules to start a workflow with the granule as payload.
- Dashboard menus now support `GITC` and `DAAC` labels. The dashboard also
  supports addition of new labels.

### Changed

- The Rules add and edit forms are changed to a JSON editor box
- All Rule fields are now editable on the dashboard

### Fixed

- batch-async-command now collects all errors in a queue, rather than emptying
  the queue after the first error

## [v1.1.0] - 2018-04-20

### Added

- Expandable errors. [CUMULUS-394]

### Changed

- In `components/logs/viewer.js`, changed references to `type` to `level` to
  match cumulus v1 logging [CUMULUS-306].
- Tests use ava instead of tape. [CUMULUS-418]
- Remove `defaultVersion` from the config. To use a particular version of the
  API, just set that in the API URL.

## v1.0.1 - 2018-03-07

### Added

- Versioning and changelog [CUMULUS-197] by @kkelly51

[Unreleased]: https://github.com/nasa/cumulus-dashboard/compare/v6.0.0...HEAD
[v6.0.0]: https://github.com/nasa/cumulus-dashboard/compare/v5.0.0...v6.0.0
[v5.0.0]: https://github.com/nasa/cumulus-dashboard/compare/v4.0.0...v5.0.0
[v4.0.0]: https://github.com/nasa/cumulus-dashboard/compare/v3.0.0...v4.0.0
[v3.0.0]: https://github.com/nasa/cumulus-dashboard/compare/v2.0.0...v3.0.0
[v2.0.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.10.0...v2.0.0
[v1.10.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.9.0...v1.10.0
[v1.9.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.8.1...v1.9.0
[v1.8.1]: https://github.com/nasa/cumulus-dashboard/compare/v1.8.0...v1.8.1
[v1.8.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.7.2...v1.8.0
[v1.7.2]: https://github.com/nasa/cumulus-dashboard/compare/v1.7.1...v1.7.2
[v1.7.1]: https://github.com/nasa/cumulus-dashboard/compare/v1.7.0...v1.7.1
[v1.7.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.6.1...v1.7.0
[v1.6.1]: https://github.com/nasa/cumulus-dashboard/compare/v1.6.0...v1.6.1
[v1.6.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.5.0...v1.6.0
[v1.5.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/nasa/cumulus-dashboard/compare/v1.0.1...v1.1.0

[Cumulus Distribution Metrics documentation]:
  https://nasa.github.io/cumulus/docs/features/distribution-metrics
