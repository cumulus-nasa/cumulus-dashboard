'use strict';

import test from 'tape';
import Adapter from 'enzyme-adapter-react-15';
import React from 'react';
import { shallow, configure } from 'enzyme';

import { GranuleOverview } from '../../../app/scripts/components/granules/granule.js';

configure({ adapter: new Adapter() });

test('CUMULUS-336 Granule file links use the correct URL', function (t) {
  const granules = {
    map: {
      'my-granule-id': {
        data: {
          name: 'my-name',
          filename: 'my-filename',
          bucket: 'my-bucket',
          status: 'success',
          files: [
            {
              name: 'my-name',
              filename: 's3://my-bucket/my-key-path/my-name',
              bucket: 'my-bucket'
            }
          ]
        }
      }
    }
  };

  const logs = { items: [] };

  const params = { granuleId: 'my-granule-id' };

  const granuleOverview = shallow(<GranuleOverview
      params={params}
      granules={granules}
      logs={logs}
      skipReloadOnMount={true} />);

  const sortableTable = granuleOverview.find('SortableTable');
  t.equal(sortableTable.length, 1);
  const sortableTableWrapper = sortableTable.dive();
  t.equal(sortableTableWrapper.find('tbody tr td a[href="https://my-bucket.s3.amazonaws.com/my-key-path/my-name"]').length, 1);

  t.end();
});
