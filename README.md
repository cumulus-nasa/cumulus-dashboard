# Cumulus Dashboard

[![CircleCI](https://circleci.com/gh/nasa/cumulus-dashboard.svg?style=svg)](https://circleci.com/gh/nasa/cumulus-dashboard)

Code to generate and deploy the dashboard for the Cumulus API.

## Documentation

- [Usage](https://github.com/cumulus-nasa/cumulus-dashboard/blob/master/USAGE.md)
- [Technical documentation on tables](https://github.com/cumulus-nasa/cumulus-dashboard/blob/master/TABLES.md)

## Wireframes and mocks

- [Designs](ancillary/dashboard-designs.pdf)
- [Wireframes](ancillary/dashboard-wireframes.pdf)

## Configuration

The dashboard is populated from the Cumulus API. The dashboard has to point to a working version of the Cumulus API before it is installed and built.

The information needed to configure the dashboard are stored at `app/scripts/config/config.js`.

The following Environment Variables override the default values in `config.js`:

| Env Name | Description
| -------- | -----------
| HIDE_PDR | whether to hide the PDR menu, default to true
| DAAC\_NAME | e.g. LPDAAC, default to Local
| STAGE | e.g. UAT, default to development
| LABELS | gitc or daac localization (defaults to daac)
| APIROOT | the API URL. This must be set as it defaults to example.com 

     $ DAAC_NAME=LPDAAC STAGE=dev HIDE_PDR=false LABELS=daac APIROOT=https://myapi.com npm run serve

## Building in Docker

The Cumulus Dashboard can be built inside of a Docker container, without needing to install any local dependencies.

Example of building for the "production" environment:
```
$ ./bin/build_in_docker production
```

The compiled files will be placed in the `dist` directory.

## Building locally

This requires [nvm](https://github.com/creationix/nvm) and node v8.11. To set v8.11 as the default, use `nvm use`.

```(bash)
git clone https://github.com/cumulus-nasa/cumulus-dashboard
cd cumulus-dashboard
nvm use
npm install
npm run serve
```

## Deployment Using S3

First build the site

     $ DAAC_NAME=LPDAAC STAGE=production HIDE_PDR=false LABELS=daac APIROOT=https://myapi.com npm run build

Then deploy the `dist` folder

     $ aws s3 sync dist s3://my-bucket-to-be-used --acl public-read

## Running locally in docker

There is a script called `bin/build_docker_image.sh` which will build a Docker image
that runs the Cumulus Dashboard.  It expects that the dashboard has already been
built and can be found in the `dist` directory.

The script takes one optional parameter, the tag that you would like to apply to
the generated image.

Example of building and running the project in Docker
```
$ ./bin/build_docker_image.sh cumulus-dashboard:production-1
...
$ docker run -e PORT=8181 -p 8181:8181 cumulus-dashboard:production-1
```

In this example, the dashboard would be available at http://localhost:8181/

## Adding a new page

### 1. Create the component

Components can be an entire page, or a portion of a page. Component files go in `app/scripts/components`. If the component has many child components (a page with charts, tables, etc) then consider making a separate directory. In the case of the collections component:

 - `app/scripts/components/collections/index.js` is the parent or main page.
 - A search component could live in `app/scripts/components/collections/search.js`.
 - A bar chart component that is shared with other pages could live in `app/scripts/components/charts/bar.js`.

If a component is very simple, it may not need a unique directory, and can be simply `app/scripts/components/404.js`, for example.

A bare bones component file at `app/scripts/__sample-component__.js` can be copy and pasted into the proper directory.

### 2. Add the component to the router

The router tells the app what the component's URL should be. In our app, a route looks like a line of HTML, so we'll call them elements. A route element requires at minimum `path` and `component` properties. Path defines the url path, and component is the name of the component.

When one route is nested within another route, the urls stack. In the following example, the list component's path is `/collections/list`.

```(html)
<Route path='/collections' component={Collections}>
   <Route path='/list' component={List} />
</Route>
```

The routes are all defined in `app/scripts/main.js`. Make sure to `import` the necessary component at the top of the file.

```javascript
import Collections from './components/collections'
import List from './components/collections/list'
```

More on imports: if the name of the file is `index.js`, you don't need to spell it out, and can instead specify the name of the parent directory. You also don't need to include the file extension (assuming it's `.js`).

For more on Router, including how to pass variables in the url, see the [docs on github](https://github.com/ReactTraining/react-router/tree/master/docs).

### 3. Linking to the component

Instead of using `<a href="path/to/component">` tags, we use `<Link to="path/to/component" />`. This gives us a few convenience features.  Just remember to import the Link module:

```javascript
import { Link } from 'react-router';
```

## Writing an API query

To write an API query, we need to write actions and reducers.

Actions let the interface initiate requests. A good example: a submit button calls an action to initiate a GET. Once the API returns that data, we call another action to place it in the store, along with an accompanying identifier.

Finally, we write a reducer to identify this action and optionally manipulate the data before assigning it a namespaced location.

**A high-level example**:

1. User navigates to the `collections` page, which starts a request to list all active collections.
2. The API responds, and we assign the data to `store.api.collections` as an array with format `[{ id: 1 }, { id: 2 }, { id: 3 }, ...]`.
3. We also assign each individual collection to `store.api.collectionDetail` as an object with format `{ 1: {}, 2: {}, 3: {} }` so it can be easily accessed by single collection pages.
4. The active collections page displays a table by accessing `this.props.api.collections`. The user clicks on a single collection to go to `collections/1`.
5. The single collection component decides whether the collection `{ id: 1 }` exists in `this.props.api.collectionDetail`; if it does, it renders using that data. Otherwise, it initiates a new GET request.

### Writing actions

We might want to write an action to query a single granule by id. To do this, we create a function in `scripts/actions/index.js`.

```javascript
export const getGranule = function (granuleId) {
  return function (dispatch) {
    // do ajax query
    request.get(granuleId, function (err, resp) {
      if (err) { console.log(err); }
      dispatch(setGranule(granuleId, resp[0]));
    })
  };
}
```

Note, `dispatch` allows us to write async actions.

We'll need another action to send this data to the store. Note, we probably don't need to export this action. In the same file:

```javascript
function setGranule (id, granuleData) {
  return { type: SET_GRANULE, id: id, data: granuleData };
}
```

This sends the granule data to the store. We need to specify the primary key so we can identify this action in a reducer function, and place it appropriately. In `actions.js`:

```javascript
export const SET_GRANULE = 'SET_GRANULE';
```

Now in `reducers/api.js` we import the primary key and export a reducer function, which receives the current state, and the reducer in question. We use a primary key, because every action is sent to every reducer. The reducer doesn't manipulate the current state, but rather returns a new state object that includes the new data.

```javascript
import { SET_GRANULE } from '../actions';
export function reducer (currentState, action) {
  const newState = Object.assign({}, currentState);
  if (action.type === SET_GRANULE) {
    newState.granuleDetail[action.id] = action.data;
  }
  return newState;
};
```

Finally, this allows us to access the data from a component, where component state is passed as a `prop`:

```javascript
// import the action so we can call it
import { getGranule } from '../actions';

const Granule = React.createClass({

  componentWillMount: function () {
    // params are passed as props to each component,
    // and id is the namespace for the route in `scripts/main.js`.
    const granuleId = this.props.params.id;
    getGranule(granuleId);
  },

  render: function () {
    const granuleId = this.props.params.id;
    const granule = this.props.api.granuleDetail[granuleId]; // should use object-path#get for this
    if (!granule) {
      return <div></div>; // return empty since we have no data yet
    }
    return <div className='granule'>{granule.granuleId}</div>;
  }
});
```

## Writing CSS

We follow a [Bem](http://getbem.com/naming/) naming format.
