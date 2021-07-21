import { encode } from '../utils/browser';
// import executions from "../reducers/executions";

const routes = [
  ['Overview', null]
];

const executionListRoutes = [
  ['Executions', null, 'sidebar__nav--back']
];

const singleRoutes = [
  ['Back to Executions', null, 'sidebar__nav--back'],
  ['Details', 'execution/:executionArn'],
  ['Events', 'execution/:executionArn/events'],
  ['Logs', 'execution/:executionArn/logs']
];

const empty = [['', '']];

const handler = {
  base: 'executions',
  heading: 'Executions',
  routes: (currentRoute, params) => {
    if (currentRoute.includes('executions/execution/')) {
      return singleRoutes.map((d) => {
        if (!d[1] || !d[1].includes(':executionArn')) { return d; }
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':executionArn', params.executionArn));
        return copy;
      });
    }
    if(currentRoute.includes('executions/executions-list/')) {
      return executionListRoutes;
    }
    if (currentRoute.slice(0, 12) !== '/executions') {
      return empty;
    }
    return routes;
  }
};

export default handler;
